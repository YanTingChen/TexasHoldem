import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Exceptions from '../../models/Exceptions';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameSelectSeatRepository')
export default class GameSelectSeatRepository extends BaseRepository {
    constructor() { super(); }

    public async getPlayerInfo(playerID): Promise<{
        table,
        sessionRecordID,
        roundStatusID,
        channelName,
        seat,
        nickName,
        amount,
        handsAmount,
        castTime,
        diamond,
        bet,
        action,
        countDown,
        deskBetPool,
        insurance
    }> {
        return this.redisManger.hgetall(GameRedis.HASH_PLAYERINFO + playerID);
    }
    // public async getPlayerRedisSession(memberId): Promise<any> {
    //     const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
    //     const resNumber = _.toNumber(res[0]);
    //     return resNumber === -1 ? -33 : resNumber;
    // }
    public async getDesk(playChannelName): Promise<{deskMin, session, playerCountDown, playerSit, deskStatus}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName,
            'session', 'playerCountDown', 'deskMin', 'deskStatus');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [[session, playerCountDown, deskMin, deskStatus], playerSit] = Utils.getPipelineData(res);
        return {
            deskMin,
            session,
            playerCountDown,
            playerSit,
            deskStatus: _.toNumber(deskStatus)
        };
    }
    public async getDeskLimitMoney(playChannelName) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMin', 'deskMax');
        return {
            deskMin: res[0],
            deskMax: res[1]
        };
    }
    public async playTakeSit(
        playChannelName,
        position,
        playerID,
        point,
        remainAmount,
        playerCountDown,
        nickName): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lset(GameRedis.LIST_PLAYER_SIT + playChannelName, position, playerID);
        pipeline.hincrby(GameRedis.HASH_DESKINFO + playChannelName, 'deskPeople', 1);
        pipeline.lset(GameRedis.LIST_PLAYING_PLAYER + playChannelName, position, nickName);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, position, point);
        pipeline.hmset(GameRedis.HASH_FRONT_BET + playChannelName, playerID, 0);
        const pipeline2 = await this.redisManger.pipeline();
        pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            seat: position,
            handsAmount: point,
            amount: remainAmount,
            countDown: playerCountDown,
            action: Constant.PLAYER_INTO_SEAT
        });
        return Promise.all([pipeline.exec(), pipeline2.exec()]);
    }
    // 拿全部桌子資料
    public async getDeskInfo(playChannelName: string): Promise<{
        deskStatus,
        dHost,
        dbig,
        dsmall,
        frontmoney,
        deskMoney,
        round,
        playerSit,
        playerName,
        publicPoker,
        playerAction,
        playerPoint}> {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline   // [null,[0,0,0,0,0,0,0]]
        .hgetall(GameRedis.HASH_DESKINFO + playChannelName)
        .lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYING_PLAYER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1)
        .exec();
        const [deskInfo,
            playerSit,
            playerName,
            publicPoker,
            playerAction,
            playerPoint] = Utils.getPipelineData(res);
        return {
            deskStatus: deskInfo.deskStatus,
            dHost: deskInfo.dHost,
            dbig: deskInfo.dBig,
            dsmall: deskInfo.dSmall,
            frontmoney: deskInfo.frontMoney,
            deskMoney: deskInfo.deskMoney,
            round: deskInfo.round,
            playerSit,
            playerName,
            publicPoker,
            playerAction,
            playerPoint
        };
    }
    public async setPlayerAction(playerID: string): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.STATUS_WAITBIG);
    }
}
