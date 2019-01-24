import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameAddPointRepository')
export default class GameAddPointRepository extends BaseRepository {
    constructor() { super(); }

    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }

    public async getPlayInfo(playerId: string): Promise<{table, seat, amount, handsAmount}> {
        const Info = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + playerId,
            'table', 'seat', 'amount', 'handsAmount');
        return {
            table: Info[0],
            seat: _.toNumber(Info[1]),
            amount: _.toNumber(Info[2]),
            handsAmount: _.toNumber(Info[3])

        };
    }

    public async getDeskMin(ChannelName: string): Promise<any> {
        return this.redisManger.hget(GameRedis.HASH_DESKINFO + ChannelName, 'deskMin');
    }

    public async updatePlayInfoNeedBuy(playerId: string, channelName, seat, newAmount, newhandsAmount): Promise<any> {
        const pipelinePlayer = await this.redisManger.pipeline();
        const pipelineDesk = await this.redisManger.pipeline();
        pipelinePlayer.hmset(GameRedis.HASH_PLAYERINFO + playerId, {
            amount: newAmount,
            handsAmount: newhandsAmount,
            disconnectionAmount: newAmount,
            action: Constant.STATUS_ADD_BET
        });
        pipelineDesk.hincrby(GameRedis.HASH_DESKINFO + channelName, 'deskPeople', Constant.PLAYING_PLAYER);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_POINT + channelName, seat, newhandsAmount);
        return Promise.all([pipelineDesk.exec(), pipelinePlayer.exec()]);
    }

    public async updatePlayInfoNoBuy(playerId: string, channelName, seat, newAmount): Promise<any> {
        const pipelinePlayer = await this.redisManger.pipeline();
        const pipelineDesk = await this.redisManger.pipeline();
        pipelinePlayer.hmset(GameRedis.HASH_PLAYERINFO + playerId, {
            seat: Constant.PLAYER_SEAT_INIT,
            amount: newAmount,
            disconnectionAmount: newAmount,
            action: Constant.STATUS_LOOK
        });
        pipelineDesk.lset(GameRedis.LIST_PLAYER_ACTION + channelName, seat, Constant.NO_ACTION);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_POINT + channelName, seat, Constant.INIT);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_SIT + channelName, seat, Constant.INIT);
        pipelineDesk.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, seat, Constant.INIT);
        pipelineDesk.hset(GameRedis.HASH_LOOK_PLAYER + channelName, playerId, Constant.LOOKING_PLAYER);
        return Promise.all([pipelineDesk.exec(), pipelinePlayer.exec()]);
    }

    public async getNewSit(channelName: string): Promise<{
        playerSit,
        playerName,
        playerPoint,
        gameStart}> {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline
        .lrange(GameRedis.LIST_PLAYER_SIT + channelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYING_PLAYER + channelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + channelName, 0, -1)
        .exec();
        const [
            playerSit,
            playerName,
            playerPoint] = Utils.getPipelineData(res);
        return {
            playerSit,
            playerName,
            playerPoint,
            gameStart: 1
        };
    }

}
