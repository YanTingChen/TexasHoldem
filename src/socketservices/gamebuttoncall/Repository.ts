import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameButtonCallRepository')
export default class GameButtonCallRepository extends BaseRepository {
    constructor() { super(); }

    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }

    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'session');
        return res[0] || -99;
    }

    public async getNowDesk(playChannelName: string, playerID: string) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName,
            'nowPlayer',
            'deskMoney',
            'frontMoney',
            'dBigCost',
            'countDown'
            );
        pipeline.hmget(GameRedis.HASH_FRONT_BET + playChannelName, playerID);
        const res = await pipeline.exec();
        const [deskInfo, frontBet] = Utils.getPipelineData(res);
        if (_.toNumber(deskInfo[2]) === 0) {
            deskInfo[2] = deskInfo[3];
        }
        return{
            nowPlayer: _.toNumber(deskInfo[0]),
            deskMoney: _.toNumber(deskInfo[1]),
            frontDeskMoney: _.toNumber(deskInfo[2]),
            countDown: _.toNumber(deskInfo[4]),
            frontBet
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

    public async setPlayerInfo(playerID: string, costMoney, countDown): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hincrby(GameRedis.HASH_PLAYERINFO + playerID, 'handsAmount', -costMoney);
        pipeline.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            bet: costMoney,
            action: Constant.STATUS_CALL,
            countDown
        });
        const res = await pipeline.exec();
        const [dealFinishMoney, []] = Utils.getPipelineData(res);
        return dealFinishMoney;
    }

    public async setDeskInfo(playChannelName: string, frontMoney, seat, playerID, needCostMoney, dealFinishMoney) {
        const pipeline = this.redisManger.pipeline();
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, seat, Constant.PLAYER_ACTION_CALL);
        pipeline.hincrbyfloat(GameRedis.HASH_FRONT_BET + playChannelName, playerID, needCostMoney);
        pipeline.hincrbyfloat(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney', needCostMoney);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, seat, dealFinishMoney);
        const res = await pipeline.exec();
        const [, newCallMoney] = Utils.getPipelineData(res);
        return newCallMoney;
    }

    public async playerPoint(channelName): Promise<any> {
        return this.redisManger.lrange(GameRedis.LIST_PLAYER_POINT + channelName, 0, -1);
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
