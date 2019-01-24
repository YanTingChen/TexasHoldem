import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameStartRepository')
export default class GameStartRepository extends BaseRepository {
    constructor() { super(); }

    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(playChannelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'session');
        return res[0] || -99;
    }
    public async getDeskDec(playChannelName: string): Promise<{
        deskStatus,
        deskPeople,
        frontMoney,
        masterCountDowner,
        preTime,
        CountDowner,
        startPeople}> {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline
            .hmget(GameRedis.HASH_DESKINFO + playChannelName,
                'deskStatus', 'deskPeople', 'frontMoney', 'masterCountDowner', 'preTime', 'startPeople')
            .lrange(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, -1)
            .exec();
        const [deskData, CountDowner] = Utils.getPipelineData(res);
        return{
            deskStatus: _.toNumber(deskData[0]),
            deskPeople: _.toNumber(deskData[1]),
            frontMoney: _.toNumber(deskData[2]),
            masterCountDowner: _.toNumber(deskData[3]),
            preTime: deskData[4],
            CountDowner,
            startPeople: _.toNumber(deskData[5])
        };
    }
    public async setPeopleNotFull(playchannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + playchannelName, {
            dHost: -1,
            dSmall: -1,
            dBig: -1,
            deskStatus: 0
        });
        pipeline.del(GameRedis.LIST_COUNT_DOWNER + playchannelName);
        return pipeline.exec();
    }
    public async tableNeedInit(
        channelName, plays) {
        const initOnePlays: number[] = _.fill(Array(plays), -1);
        const initZeroPlays: number[] = _.fill(Array(plays), 0);
        const init100Plays: number[] = _.fill(Array(plays), 100);
        const pipeline = await this.redisManger.pipeline();
        // 控制倒數
        return pipeline
        .del(GameRedis.HASH_DESKINFO + channelName,
            GameRedis.LIST_PLAYER_SIT + channelName,
            GameRedis.HASH_FRONT_BET + channelName,
            GameRedis.LIST_PLAYING_PLAYER + channelName,
            GameRedis.LIST_PLAYER_POINT + channelName,
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
    // public async checkMasterCountDowner(playChannelName) {
    //     const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'masterCountDowner');
    //     return _.toNumber(res[0]);
    // }
    public async getPlayerPointList(playChannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [point, player] = Utils.getPipelineData(res);
        return {
            point,
            player
        };
    }
    public async getDeskInfo(playChannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'dHost', 'dSmall', 'dBig', 'round', 'deskMoney');
        pipeline.lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [[host, small, big, round, money], publicPoker] = Utils.getPipelineData(res);
        return {
            host,
            small,
            big,
            round,
            money,
            publicPoker
        };
    }
    public async pushCountDowner(playChannelName: string, playerID: string) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.rpush(GameRedis.LIST_COUNT_DOWNER + playChannelName, playerID);
        return pipeline.exec();
    }
    public async getCountDowner(playChannelName) {
        const res = await this.redisManger.lrange(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, -1);
        return res[0];
    }
    public async getDeskCountDowdTime(playChannelName) {
        await this.redisManger.lset(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, -1);
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'countDown');
        return _.toNumber(res[0]);
    }
    public async getDeskInit(playChannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName,
            'dHost', 'dSmall', 'dBig',
            'dSmallCost', 'dBigCost',
            'deskPeople', 'beforeGamePlayer', 'straddle', 'countDown', 'session', 'seatSpace');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [
        [host, small, big, smallCost, bigCost,
        deskPeople, beforeGamePlayer, straddle, countDown, session, seatSpace],
        playerSit] = Utils.getPipelineData(res);
        const pipeline2 = await this.redisManger.pipeline();
        const playSitPosition = Utils.findPlaySitPosition(playerSit);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playSitPosition.length; i++) {
            pipeline2.hmget(GameRedis.HASH_PLAYERINFO + playSitPosition[i].playerId, 'action');
        }
        const action = await pipeline2.exec();

        for (let i = 0; i < playSitPosition.length; i++) {
            // tslint:disable-next-line:prefer-conditional-expression
            if (playSitPosition[i].playerId !== Constant.NO_PLAYER_S) {
                playSitPosition[i].action = _.toNumber(action[i][1]);
            } else {
                playSitPosition[i].action = Constant.STATUS_ACTION_NOPLAYER;
            }
        }
        return {
            host,
            small,
            big,
            smallCost,
            bigCost,
            deskPeople: _.toNumber(deskPeople),
            straddle: _.toNumber(straddle),
            beforeGamePlayer: _.toNumber(beforeGamePlayer),
            playerSit: playSitPosition,
            countDown,
            session: _.toNumber(session),
            seatSpace: _.toNumber(seatSpace)
        };
    }
    public async setLookPlayerCode(playChannelName: string, playingList) {
        const pipeLine = await this.redisManger.pipeline();
        for (const playerID of playingList) {
            pipeLine.hmset(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerID, Constant.PLAYING_PLAYER);
        }
        return pipeLine.exec();
    }
    public async initNewGame(
        channelName, dHost, dBig, dSmall, deskMoney, frontMoney, nowPlayer, publicPokers, raiseMoney,
        onlinePeople) {
        const pipeline = await this.redisManger.pipeline();
        // 控制倒數
        return pipeline
        .del(GameRedis.LIST_PUBLIC_POKER + channelName,
            GameRedis.LIST_PA_POOL + channelName,
            GameRedis.HASH_FRONT_BET + channelName)
        .hmset(GameRedis.HASH_DESKINFO + channelName, {
            dHost: dHost.playerPosition,
            dBig: dBig.playerPosition,
            dSmall: dSmall.playerPosition,
            deskMoney,
            frontMoney,
            deskStatus: Constant.STATUS_ACTIVE,
            nowPlayer: nowPlayer.playerPosition,
            round: 1,
            raiseMoney,
            beforeGamePlayer: onlinePeople,
            countDownerControl: 1
        })
        .rpush(GameRedis.LIST_PUBLIC_POKER + channelName, ...publicPokers)
        .exec();
    }
    public async setPlayerPoker(
        getPlayerSitPosition: Array<{playerPosition: number, playerId: string, pokers: number[], action: number}>,
        playChannelName, countDown, session) {
            const pipeline1 = await this.redisManger.pipeline();
            const pipeline2 = await this.redisManger.pipeline();
            await Promise.all(getPlayerSitPosition.map(async (player) => {
                if (_.toNumber(player.action) !== Constant.STATUS_WAITBIG &&
                    player.playerId !== Constant.NO_PLAYER_S &&
                    _.toNumber(player.action) !== Constant.NO_ACTION) {
                    pipeline1.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, player.playerPosition, 0);
                    pipeline1.hset(GameRedis.HASH_FRONT_BET + playChannelName, player.playerId, 0);
                    // 存各個玩家的私牌
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + player.playerId, {
                        sessionRecordID: session,
                        action: Constant.STATUS_ACTION,
                        countDown
                    });
                    pipeline2.lset(GameRedis.LIST_POKER + player.playerId, 0 , player.pokers[0]);
                    pipeline2.lset(GameRedis.LIST_POKER + player.playerId, 1 , player.pokers[1]);
                    return this.socketPushManager.publishChannel(
                        Constant.PRIVATE_CHANNEL + player.playerId, {
                            protocol: GameSend.PROTOCOL_PRIVATE_POKERS,
                            playerPokers: player.pokers,
                            CANCELWAITBIG: Constant.BUTTON_CLOSE
                        });
                }
            }));
            return Promise.all([pipeline1.exec(), pipeline2.exec()]);
    }
    public async playerInfo(playChannelName, getPlayerSitPosition, deskMoney): Promise<any> {
        getPlayerSitPosition =  Utils.findPlaySitPositionNO(getPlayerSitPosition);
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'round');
        for (const data of getPlayerSitPosition) {
            pipeLine.hgetall(GameRedis.HASH_PLAYERINFO + data.playerId);
        }
        const res = await pipeLine.exec();
        const dataList = Utils.getPipelineData(res);
        const pipeLine2 = await this.redisManger.pipeline();
        for (let i = 1, id = 0; i < dataList.length ; i++, id++) {
            const player = new PlayerRecordEntity();
            const playInfo = dataList[i];
            const handPoker = `[${getPlayerSitPosition[id].pokers[0]},${getPlayerSitPosition[id].pokers[1]}]`;
            player.um_id = getPlayerSitPosition[id].playerId;
            player.pr_sessionRecordID = playInfo.sessionRecordID;
            player.pr_round = dataList[0][0];
            player.pr_handsAmount = playInfo.handsAmount;
            player.pr_seat = playInfo.seat;
            player.pr_hands = handPoker;
            player.pr_action = playInfo.action;
            player.pr_deskBetPool = _.toString(deskMoney);
            player.pr_costTime = '0';
            player.pr_bet = playInfo.bet;
            player.pr_insurance = playInfo.insurance;
            pipeLine2.rpush(GameRedis.LIST_PLAYER_BET_RECORD + playChannelName, player.makePlayerRecord());
        }
        return pipeLine2.exec();
    }
    public async subPlayerBet(
        playerBigList, bigBet,
        playerSmallId, smallBet, straddle) {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hincrbyfloat(GameRedis.HASH_PLAYERINFO + playerSmallId, 'handsAmount', -smallBet);
        const bigList: any = [];
        const bigSeatList: any = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playerBigList.length; i++) {
            pipeLine.hincrbyfloat(GameRedis.HASH_PLAYERINFO + playerBigList[i].playerId, 'handsAmount', -bigBet);
            bigList.push({
                playerID: playerBigList[i].playerId,
                playerPosition: playerBigList[i].playerPosition,
                playerCost: bigBet
            });
            bigSeatList.push(playerBigList[i].playerPosition);
        }
        if (straddle === Constant.SYSTEM_IS_OPEN) {
            const straddleMoney = new BigNumber(bigBet).multipliedBy(2).toNumber();
            pipeLine.hincrbyfloat(GameRedis.HASH_PLAYERINFO + straddle.playerId, 'handsAmount', -straddleMoney);
            bigList.push({
                playerID: straddle.playerId,
                playerPosition: straddle.playerPosition,
                playerCost: bigBet
            });
        }
        const res = await pipeLine.exec();
        const [smallBetPoit] = Utils.getPipelineData(res);
        // bigBetPoint = [ [ null, [ '0' ] ], [ null, [ '0' ] ] ]
        const bigBetPointList: any = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 1; i < res.length; i++) {
            bigBetPointList.push(res[i][1]);
        }
        return {
            smallBetPoit,
            bigBetPointList,
            bigList,
            bigSeatList
        };
    }
    public async setPlayerBet(
        // 要改  playerIdSmallPosition playerIdBigPosition
        playChannelName,
        playerIdSmallPosition, smallBetPoit, smallCost, smallID,
        bigList, bigBetPoint) {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, playerIdSmallPosition, smallBetPoit);
        pipeLine.hincrbyfloat(GameRedis.HASH_FRONT_BET + playChannelName, smallID, smallCost);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < bigList.length; i++) {
            pipeLine.lset(
                GameRedis.LIST_PLAYER_POINT + playChannelName,
                bigList[i].playerPosition, bigBetPoint[i]);
            pipeLine.hincrbyfloat(
                GameRedis.HASH_FRONT_BET + playChannelName,
                bigList[i].playerID, bigList[i].playerCost);
        }
        await pipeLine.exec();
        const playerPoint = await this.redisManger.lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1);
        return playerPoint;
    }
    public async getDeskInfo2(playChannelName): Promise <{
        host,
        dSmall,
        dBig,
        deskMoney,
        round,
        frontMoney,
        nowPlayer,
        paPool,
        publicPoker,
        playerAction,
        playerPoint,
        playerBet,
        nowPlayerID}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName,
            'dHost', 'dSmall', 'dBig', 'deskMoney', 'round', 'frontMoney', 'nowPlayer'
        );
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1);
        // pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.HASH_FRONT_BET + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [[host, dSmall, dBig, deskMoney, round, frontMoney, nowPlayer],
               paPool, publicPoker, playerAction, playerPoint, playerBet] = Utils.getPipelineData(res);
        const nowPlayerID =
            await this.redisManger.lindex(GameRedis.LIST_PLAYER_SIT + playChannelName, _.toNumber(nowPlayer));
        return {
            host,
            dSmall,
            dBig,
            deskMoney,
            round,
            frontMoney,
            nowPlayer,
            paPool,
            publicPoker,
            playerAction,
            playerPoint,
            playerBet,
            nowPlayerID
        };
    }
    public async changeNoMoneyAction(playChannelName, changeAction): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < changeAction.length; i++) {
            pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName,
                changeAction[i], Constant.PLAYER_ACTION_ALLIN);
        }
        return pipeline.exec();
    }

    public async delCountDowner(playChannelName): Promise<any> {
        return this.redisManger.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
    }

    public async setPlayerButton(playerId, allin, check, raise, call, bet): Promise<any> {
        await this.redisManger.rpush(GameRedis.LIST_BUTTON + playerId, allin, check, raise, call, bet);
        return ;
    }

    public async setPreTime(time: Date, playChannelName: string) {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'preTime', time);
    }
    public async getNowDesk(playChannelName: string): Promise<{nowPlayer, playerID, playerSit}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.lset(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, '-1');
        const res = await pipeline.exec();
        const [nowPlayer, playerSit, countDowner] = Utils.getPipelineData(res);
        const playerID =
        await this.redisManger.lindex(GameRedis.LIST_PLAYER_SIT + playChannelName, _.toNumber(nowPlayer));
        return {
            nowPlayer: _.toNumber(nowPlayer[0]),
            playerID,
            playerSit: Utils.findPlaySitPosition(playerSit)
        };
    }
    public async getPlayerTime(nowPlayerID: string, playChannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + nowPlayerID, 'countDown');
        // 控制倒數
        const pipeline2 = await this.redisManger.pipeline();
        pipeline2.hmget(GameRedis.HASH_DESKINFO  + playChannelName, 'countDownerControl');
        const res = await pipeline.exec();
        const res2 = await pipeline2.exec();
        const [countDown] = Utils.getPipelineData(res);
        const [countDownerControl] = Utils.getPipelineData(res2);
        // return res[0] ? _.toNumber(res[0]) : -1;
        return {
            countDown: countDown[0] ? _.toNumber(countDown[0]) : -1,
            countDownerControl: _.toNumber(countDownerControl[0])
        };
    }
    public async getPlayerPoint(playerId, playChannelName) {
        return this.redisManger.hmget(GameRedis.HASH_FRONT_BET + playChannelName, playerId);
    }
}
