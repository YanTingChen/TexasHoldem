import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { MemberRedis } from '../../config/MemberRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameDisconnectRepository')
export default class GameDisconnectRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerInfo(playerID): Promise<{
        table, seat, amount, handsAmount, action
    }> {
        const Info = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + playerID,
            'table', 'seat', 'amount', 'handsAmount', 'action');
        return {
            table: Info[0],
            seat: _.toNumber(Info[1]),
            amount: _.toNumber(Info[2]),
            handsAmount: _.toNumber(Info[3]),
            action: _.toNumber(Info[4])

        };
    }

    public async getLookGamer(playerID, table): Promise<{
        loolPlayerList, playerAction, seatSpace, deskStatus
    }> {
        await this.redisManger.hset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.DISCONNECT_PLAYER);
        await this.redisManger.hset(GameRedis.HASH_LOOK_PLAYER + table, playerID, Constant.DISCONNECT_PLAYER);
        const pipelineDesk = await this.redisManger.pipeline();
        pipelineDesk.hgetall(GameRedis.HASH_LOOK_PLAYER + table);
        pipelineDesk.lrange(GameRedis.LIST_PLAYER_ACTION + table, 0, -1);
        pipelineDesk.hmget(GameRedis.HASH_DESKINFO + table, 'seatSpace', 'deskStatus');
        const res = await pipelineDesk.exec();
        const [lookPlayer, playerAction,
            [deskPeople, deskStatus]] = Utils.getPipelineData(res);
        const loolPlayerList = Utils.getHgetAllKeyValue(lookPlayer);
        return {
            loolPlayerList,
            playerAction,
            seatSpace: _.toNumber(deskPeople),
            deskStatus: _.toNumber(deskStatus)
        };
    }

    public async updateNewAction(table, newPlayerAction): Promise<any> {
        await this.redisManger.del(GameRedis.LIST_PLAYER_ACTION + table);
        await this.redisManger.rpush(GameRedis.LIST_PLAYER_ACTION + table, ...newPlayerAction);
        return this.redisManger.lrange(GameRedis.LIST_PLAYER_ACTION + table, 0, -1);
    }

    public async setCountDownerControl(channelName): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + channelName, 'countDownerControl', 0);
    }

    public async tableNeedInit(
        channelName, plays) {
        const initOnePlays: number[] = _.fill(Array(plays), -1);
        const initZeroPlays: number[] = _.fill(Array(plays), 0);
        const init100Plays: number[] = _.fill(Array(plays), 100);
        const pipeline = await this.redisManger.pipeline();
        // 控制倒數
        return pipeline
        .del(
            GameRedis.LIST_PLAYER_SIT + channelName,
            GameRedis.LIST_PLAYING_PLAYER + channelName,
            GameRedis.LIST_PLAYER_POINT + channelName,
            GameRedis.HASH_LOOK_PLAYER + channelName,
            GameRedis.LIST_PLAYER_ACTION + channelName)
        .hmset(GameRedis.HASH_DESKINFO + channelName, {
            dHost: -1,
            dBig: -1,
            dSmall: -1,
            deskMoney: 0,
            deskPeople: 0,
            frontMoney: 0,
            deskStatus: Constant.STATUS_INACTIVE,
            nowPlayer: -1,
            round: 0,
            raiseMoney: 0,
            countDownerControl: 1
        })
        .rpush(GameRedis.LIST_PLAYER_SIT + channelName, ...initOnePlays)
        .rpush(GameRedis.LIST_PLAYING_PLAYER + channelName, ...initOnePlays)
        .rpush(GameRedis.LIST_PLAYER_POINT + channelName, ...initOnePlays)
        .rpush(GameRedis.LIST_PLAYER_ACTION + channelName, ...init100Plays)
        .rpush(GameRedis.DESK_PLAYING, channelName)
        .exec();
        // 如果到時候要可以換牌才會使用這個牌池來做換牌
        // .rpush(GameRedis.LIST_PORKER_POOL + channelName, ...publicPokers)
    }

}
