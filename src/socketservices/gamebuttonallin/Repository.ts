import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameButtonAllinRepository')
export default class GameButtonAllinRepository extends BaseRepository {
    constructor() { super(); }

    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }

    public async getDeskRedisSession(channelName: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'session');
        return res[0] || -99;
    }

    public async getDeskInfo(playChannelName: string): Promise<{frontMoney, nowPlayer, countDown}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'frontMoney');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'countDown');
        const res = await pipeline.exec();
        const [frontMoney, nowPlayer, countDown] = Utils.getPipelineData(res);
        return{
            frontMoney: _.toNumber(frontMoney[0]),
            nowPlayer: _.toNumber(nowPlayer[0]),
            countDown: _.toNumber(countDown[0])
        };
    }

    public async getPlayerInfo(playerID: string): Promise<{seat, action, handsAmount}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'action');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'handsAmount');
        pipeline.del(GameRedis.LIST_BUTTON + playerID);
        const res = await pipeline.exec();
        const [seat, action, handsAmount] = Utils.getPipelineData(res);
        return {
            seat: _.toNumber(seat[0]),
            action: _.toNumber(action[0]),
            handsAmount: _.toNumber(handsAmount[0])
        };
    }

    public async setCountDownerControl(channelName): Promise<any> {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + channelName, 'countDownerControl', 0);
    }

    public async getBet(playChannelName, playerID: string, handsAmount): Promise<any> {
        return this.redisManger.hincrbyfloat(GameRedis.HASH_FRONT_BET + playChannelName, playerID, handsAmount);
    }

    public async getAllPlayerInfo(playChannelName): Promise<{frontBet, playerSit, playerAction}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [frontBet, playerSit, playerAction] = Utils.getPipelineData(res);
        return {
            frontBet,
            playerSit,
            playerAction
        };
    }

    public async setPlayerInfo(playerID: string, handsAmount, countDown): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            handsAmount: 0,
            bet: handsAmount,
            action: Constant.STATUS_ALLIN,
            countDown
        });
        return pipeline.exec();
    }

    public async setDeskInfo(playChannelName: string, handsAmount, position: number, needChangePlayer,
        realhandsAmount, frontMoney, newRaiseMoney): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + playChannelName, {
            frontMoney,
            countDownerControl: 0,
            raiseMoney: newRaiseMoney
        });
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < needChangePlayer.length; i++) {
            pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, needChangePlayer[i], 0);
        }
        pipeline.hincrbyfloat(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney', handsAmount);
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, position, Constant.PLAYER_ACTION_ALLIN);
        pipeline.sadd(GameRedis.LIST_ALLIN_BET + playChannelName, realhandsAmount);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, position, 0);
        return pipeline.exec();
    }

    public async getDeskMoney(playChannelName): Promise<{deskMoney, playerPoint}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney');
        pipeline.lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [deskMoney, playerPoint] = Utils.getPipelineData(res);
        return {
            deskMoney: _.toNumber(deskMoney),
            playerPoint
        };
    }

    public async playerInfo(channelName, playerId, deskMoney, costTime): Promise<any> {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hmget(GameRedis.HASH_DESKINFO + channelName, 'round');
        pipeLine
            .hgetall(GameRedis.HASH_PLAYERINFO + playerId)
            .lrange(GameRedis.LIST_POKER + playerId, 0, -1);
        const res = await pipeLine.exec();
        const dataList = Utils.getPipelineData(res);
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
