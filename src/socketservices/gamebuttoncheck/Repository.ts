import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameButtonCheckRepository')
export default class GameButtonCheckRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'session');
        return res[0] || -99;
    }
    public async getDeskInfo(playChannelName: string): Promise<{frontMoney, nowPlayer, countDown, deskMoney}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'frontMoney', 'nowPlayer', 'countDown', 'deskMoney');
        const res = await pipeline.exec();
        const [deskInfo] = Utils.getPipelineData(res);
        return{
            frontMoney: _.toNumber(deskInfo[0]),
            nowPlayer: _.toNumber(deskInfo[1]),
            countDown: _.toNumber(deskInfo[2]),
            deskMoney: _.toNumber(deskInfo[3])
        };
    }

    public async getPlayerInfo(playerID: string): Promise<{seat, action}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat', 'action');
        pipeline.del(GameRedis.LIST_BUTTON + playerID);
        const res = await pipeline.exec();
        const [playerInfo] = Utils.getPipelineData(res);
        return {
            seat: _.toNumber(playerInfo[0]),
            action: _.toNumber(playerInfo[1])
        };
    }
    public async setCountDownerControl(channelName): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + channelName, 'countDownerControl', 0);
    }
    public async getPlayerPoint(playChannelName, playerID): Promise<any> {
        return this.redisManger.hmget(GameRedis.HASH_FRONT_BET + playChannelName, playerID);
    }
    public async playerPoint(channelName): Promise<any> {
        return this.redisManger.lrange(GameRedis.LIST_PLAYER_POINT + channelName, 0, -1);
    }

    public async setDeakInfo(playChannelName: string, playerSeat: number): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, playerSeat, Constant.PLAYER_ACTION_CHECK);
        // pipeline.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        return pipeline.exec();
    }
    public async setPlayerInfo(playerID: string, costTime, countDown, action): Promise<any> {
        return this.redisManger.hmsetObject(GameRedis.HASH_PLAYERINFO + playerID, {
            action,
            costTime,
            countDown
        });
    }
    public async playerInfo(channelName, playerId, deskMoney, costTime): Promise<any> {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hmget(GameRedis.HASH_DESKINFO + channelName, 'round');
        pipeLine
            .hgetall(GameRedis.HASH_PLAYERINFO + playerId)
            .lrange(GameRedis.LIST_POKER + playerId, 0, -1);
        const res = await pipeLine.exec();
        const dataList = Utils.getPipelineData(res);    // [ ['1'],{table:'NN39',...},['54','144'] ]
        const newPipe = await this.redisManger.pipeline();
        const player = new PlayerRecordEntity();
        const playInfo = dataList[1];
        const handPoker = `[${dataList[2][0]},${dataList[2][1]}]`;
        player.um_id = playerId;
        player.pr_sessionRecordID = playInfo.sessionRecordID;
        player.pr_round = dataList[0][0];
        player.pr_handsAmount = playInfo.handsAmount;
        player.pr_seat = playInfo.seat;
        player.pr_hands = handPoker;
        player.pr_action = playInfo.action;
        player.pr_deskBetPool = _.toString(deskMoney);
        player.pr_costTime = costTime;
        player.pr_bet = playInfo.bet;
        player.pr_insurance = playInfo.insurance;
        newPipe.rpush(GameRedis.LIST_PLAYER_BET_RECORD + channelName, player.makePlayerRecord());
        return newPipe.exec();
    }
}
