import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameButtonMenuRepository')
export default class GameButtonMenuRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }

    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'session');
        return res[0] || -99;
    }

    public async getPlayerInfo(playerID: string): Promise<{
        seat,
        action,
        desk,
        amount,
        handsAmount}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat', 'action', 'table', 'amount', 'handsAmount');
        const res = await pipeline.exec();
        const [[seat, action, table, amount, handsAmount]] = Utils.getPipelineData(res);
        return {
            seat:  _.toNumber(seat),
            action: _.toNumber(action),
            desk: table,
            amount: _.toNumber(amount),
            handsAmount: _.toNumber(handsAmount)
        };
    }

    public async getDeskStatusInfo(playChannelName: string) {
        const [deskStatus, nowPlayer] = await
            this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskStatus', 'nowPlayer');
        const nowPleyerID = await
            this.redisManger.lindex(GameRedis.LIST_PLAYER_SIT + playChannelName, _.toNumber(nowPlayer));
        return {
            deskStatus: _.toNumber(deskStatus),
            nowPleyerID
        };
    }

    public async getPlayerSit(channelName, seat, playerID, playerAmount, action): Promise<{
        seatSpace, playerAction}> {
        const pipelinePlayer = await this.redisManger.pipeline();
        const pipelineDesk = await this.redisManger.pipeline();
        const pipeline = await this.redisManger.pipeline();
        pipelinePlayer.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            table: Constant.INIT,
            sessionRecordID: Constant.INIT,
            channelName: Constant.INIT,
            bet: Constant.INIT,
            insurance: Constant.INIT,
            handsAmount: playerAmount,
            action: Constant.STATUS_LEAVE_DESK
        });
        if (_.toNumber(action) !== Constant.NO_ACTION) {
            pipelineDesk.hincrbyfloat(GameRedis.HASH_DESKINFO + channelName,
                'deskPeople', Constant.SUB_PLAYER_LEAVE);
        }
        pipelineDesk.hdel(GameRedis.HASH_FRONT_BET + channelName, playerID);
        pipelineDesk.hdel(GameRedis.HASH_LOOK_PLAYER + channelName, playerID);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_ACTION + channelName, seat, Constant.NO_ACTION);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_POINT + channelName, seat, Constant.INIT);
        pipelineDesk.lset(GameRedis.LIST_PLAYER_SIT + channelName, seat, Constant.INIT);
        pipelineDesk.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, seat, Constant.INIT);
        await Promise.all([pipelinePlayer.exec(), pipelineDesk.exec()]);

        pipeline.hmget(GameRedis.HASH_DESKINFO + channelName, 'seatSpace');
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + channelName, 0, -1);
        const res = await pipeline.exec();
        const [seatSpace, playerAction] = Utils.getPipelineData(res);
        return {
            seatSpace: _.toNumber(seatSpace),
            playerAction
        };
    }
    public async setCountDownerControl(channelName): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + channelName, 'countDownerControl', 0);
    }

    public async updateLeaveSeat(
        channelName: string,
        playerSeat: number,
        playerID: string,
        playerAmount
    ): Promise<any> {

        const pipeline = await this.redisManger.pipeline();
        const pipeline2 = await this.redisManger.pipeline();
        // pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, 'nowPlayer', Constant.PLAYER_LEAVE_SEAT);
        pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            seat: Constant.INIT,
            costTime: Constant.INIT,
            bet: Constant.INIT,
            handsAmount: playerAmount,
            countDown: Constant.INIT,
            insurance: Constant.INIT,
            action: Constant.STATUS_LEAVE_SEAT
        });
        pipeline.hincrby(GameRedis.HASH_DESKINFO + channelName,  'deskPeople', Constant.SUB_PLAYER_LEAVE);
        pipeline.hset(GameRedis.HASH_LOOK_PLAYER + channelName, playerID, Constant.LOOKING_PLAYER);
        pipeline.lset(GameRedis.LIST_PLAYER_SIT + channelName, playerSeat, Constant.NO_PLAYER);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + channelName, playerSeat, Constant.NO_PLAYER);
        pipeline.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, playerSeat, Constant.NO_PLAYER);
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + channelName, playerSeat, Constant.NO_ACTION);
        pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.STATUS_LOOK);
        return Promise.all([pipeline.exec(), pipeline2.exec()]);
    }

    // public async updateGameInfo(
    //     channelName: string,
    //     playerSeat: number,
    //     playerID: string,
    //     playerAmount
    // ): Promise<any> {
    //     const deskStatus = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'deskStatus');
    //     const action = await this.redisManger.lindex(GameRedis.LIST_PLAYER_ACTION + channelName, playerSeat);
    //     const pipeline = await this.redisManger.pipeline();
    //     const pipeline2 = await this.redisManger.pipeline();
    //     if (_.toNumber(deskStatus) === Constant.GAME_NO_PLAYING) {
    //         // pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, 'nowPlayer', Constant.PLAYER_LEAVE_SEAT);
    //         pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
    //             table: Constant.INIT,
    //             sessionRecordID: Constant.INIT,
    //             channelName: Constant.INIT,
    //             costTime: Constant.INIT,
    //             bet: Constant.INIT,
    //             countDown: Constant.INIT,
    //             insurance: Constant.INIT,
    //             handsAmount: Constant.INIT,
    //             amount: playerAmount
    //         });
    //         pipeline.hdel(GameRedis.HASH_LOOK_PLAYER + channelName, playerID);
    //         pipeline.lset(GameRedis.LIST_PLAYER_SIT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
    //         pipeline.lset(GameRedis.LIST_PLAYER_POINT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
    //         pipeline.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
    //     }
        // if (_.toNumber(action) !== Constant.NO_ACTION) {
        //     pipeline.hincrbyfloat(GameRedis.HASH_DESKINFO + channelName, 'deskPeople', Constant.SUB_PLAYER_LEAVE);
        // }
        // pipeline.hdel(GameRedis.HASH_LOOK_PLAYER + channelName, playerID);
        // pipeline.hmset(GameRedis.HASH_FRONT_BET + channelName, playerID, Constant.NO_SHARE_PA);
        // pipeline.lset(GameRedis.LIST_PLAYER_ACTION + channelName, playerSeat, Constant.PLAYER_LEAVE_ACTION);
        // pipeline.hmset(GameRedis.HASH_LOOK_PLAYER + channelName, playerID, Constant.LOOKING_PLAYER);
        // pipeline.lset(GameRedis.LIST_PLAYER_POINT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        // pipeline.lset(GameRedis.LIST_PLAYER_SIT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        // pipeline.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        // ---
        // const pipeline2 = await this.redisManger.pipeline();
        // pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'seat', Constant.PLAYER_SEAT_INIT);
        // pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.PLAYER_LEAVE_ACTION);
        // return Promise.all([pipeline.exec(), pipeline2.exec()]);
        // return pipeline.exec();
    // }

    public async updateGameInfoNoMoney(
        channelName: string,
        playerSeat: number,
        playerID: string,
        playerAmount
    ): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        const pipeline2 = await this.redisManger.pipeline();
        pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            table: Constant.INIT,
            sessionRecordID: Constant.INIT,
            channelName: Constant.INIT,
            costTime: Constant.INIT,
            bet: Constant.INIT,
            countDown: Constant.INIT,
            insurance: Constant.INIT,
            handsAmount: Constant.INIT,
            amount: playerAmount
        });
        pipeline.hdel(GameRedis.HASH_FRONT_BET + channelName, playerID);
        pipeline.hdel(GameRedis.HASH_LOOK_PLAYER + channelName, playerID);
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + channelName, playerSeat, Constant.NO_ACTION);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        pipeline.lset(GameRedis.LIST_PLAYER_SIT + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        pipeline.lset(GameRedis.LIST_PLAYING_PLAYER + channelName, playerSeat, Constant.PLAYER_LEAVE_SEAT);
        pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.PLAYER_LEAVE_ACTION);
        return Promise.all([pipeline.exec(), pipeline2.exec()]);
    }

    public async updatePlayerInfo(playerID: string, playerAmount: number, playChannelName: string)
    : Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            table: Constant.INIT,
            sessionRecordID: Constant.INIT,
            channelName: Constant.INIT,
            costTime: Constant.INIT,
            bet: Constant.INIT,
            countDown: Constant.INIT,
            insurance: Constant.INIT,
            handsAmount: Constant.INIT,
            amount: playerAmount
        });
        const pipeline2 = await this.redisManger.pipeline();
        pipeline2.hdel(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerID);
        return pipeline.exec();
    }
    // 拿全部桌子資料
    public async getDeskInfo(playChannelName: string): Promise<{
        playerSit,
        playerName,
        playerAction,
        playerPoint}> {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline   // [null,[0,0,0,0,0,0,0]]
        .lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYING_PLAYER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1)
        .exec();
        const [
            playerSit,
            playerName,
            playerAction,
            playerPoint] = Utils.getPipelineData(res);
        return {
            playerSit,
            playerName,
            playerAction,
            playerPoint
        };
    }
    public async setPlayerAction(playerID: string): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.STATUS_CANCELWAITBIG);
    }
}
