import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameSharePaRepository')
export default class GameSharePaRepository extends BaseRepository {
    constructor() { super(); }
    // public async getPlayerRedisSession(memberId: string): Promise<any> {
    //     const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
    //     return res[0] || -33;
    // }
    // public async getDeskRedisSession(channelName: string): Promise<any> {
    //     const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'session');
    //     return res[0] || -99;
    // }
    public async getprocessPa(playChannelName): Promise <{
        roundBet,
        playerName,
        allinBet,
        deskMoney,
        paPool}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.smembers(GameRedis.LIST_ALLIN_BET + playChannelName);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney');
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.llen(GameRedis.LIST_PA_POOL + playChannelName);
        const res = await pipeline.exec();
        const [playerBet, allin, deskMoney, moneyPool, PoolCount] = Utils.getPipelineData(res);
        let allinBet: any = [];
        let paPool: any = [];
        // [66666, 50]
        // tslint:disable-next-line:prefer-conditional-expression
        if (allin.length === 0) {
            allinBet = [];
        } else {
            allinBet = Utils.getArraySortASC(allin);
        }
        // tslint:disable-next-line:prefer-conditional-expression
        if (PoolCount === '0') {
            paPool = [];
        } else {
            paPool = moneyPool;
        }
        const playerBetHash = Utils.getHgetAllKeyValue(playerBet);
        return {
            roundBet: playerBetHash.valueName,  // frontBet value
            playerName: playerBetHash.keyName,  // frontBet key
            allinBet,
            deskMoney,
            paPool
        };
    }
    public async setpaPoolInfo(playChannelName, paPool, roundBet, playerName) {
        // await this.redisManger.del(GameRedis.LIST_PA_POOL + playChannelName);
        const pipeline = await this.redisManger.pipeline();
        _.forEach(paPool, (data) => {
            pipeline.rpush(GameRedis.LIST_PA_POOL + playChannelName, data);
        });
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < roundBet.length ; i++) {
            pipeline.hmset(GameRedis.HASH_FRONT_BET + playChannelName, playerName[i], roundBet[i]);
        }
        return pipeline.exec();
    }
    // 以下是平分pa池
    public async getDeskInfo(playChannelName)
        : Promise<{playerSit, roundBet, playerName, paPool,
            publicPoker, playerAction, seatSpace, game, dBigCost, session, round}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney',
        'seatSpace', 'game', 'dBigCost', 'session', 'round');
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.llen(GameRedis.LIST_PA_POOL + playChannelName);
        pipeline.lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [
            playerSit,
            playerBet,
            [deskMoney, seatSpace, game, dBigCost, session, round],
            pool,
            poolCount,
            publicPoker,
            playerAction
            ] = Utils.getPipelineData(res);
        /*[ '23350', '37021', '37729', '5179', '-1', '-1', '-1', '-1', '-1' ],
            { '5179': '6666',
                '23350': '6666',
                '37021': '6666',
                '37729': '200' },
            [ '20198' ],
            [],
            '0',
            [ '42', '44', '122', '141', '124' ] */
        const playerBetHash = Utils.getHgetAllKeyValue(playerBet);
        let paPool: any = [];
        if (poolCount === '0') {
            paPool.push(deskMoney);
        } else {
            paPool = pool;
        }
        return {
            playerSit,
            roundBet: playerBetHash.valueName,
            playerName: playerBetHash.keyName,
            paPool,
            publicPoker,
            playerAction,
            seatSpace: _.toNumber(seatSpace),
            game: _.toNumber(game),
            dBigCost: _.toNumber(dBigCost),
            session,
            round: _.toNumber(round)
        };
    }
    public async getPlayInfo(playerSit, playerAction) {
        const pipeline = await this.redisManger.pipeline();
        // for (const data of playerSit) {
        //     if (data !== '-1') {
        //         pipeline.hmget(GameRedis.HASH_PLAYERINFO + data, 'action');
        //         pipeline.lrange(GameRedis.LIST_POKER + data, 0, -1);
        //     }
        // }
        for (let i = 0, j = 0; i < playerSit.length; i++) {
            if (playerSit[i] !== '-1' && _.toNumber(playerAction[i]) <= Constant.PLAYER_ACTION_FOLD) {
                pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerSit[i], 'action');
                pipeline.lrange(GameRedis.LIST_POKER + playerSit[i], 0, -1);
            }
        }
        const res = await pipeline.exec();
        const getInfo = Utils.getPipelineData(res);
        const playerInfo: any = [];
        for (let i = 0, j = 0; i < playerSit.length; i++) {
            if (playerSit[i] !== '-1' && _.toNumber(playerAction[i]) <= Constant.PLAYER_ACTION_FOLD) {
                playerInfo.push({
                    id: playerSit[i],
                    action: _.toNumber(getInfo[j][0]),
                    poker: getInfo[j + 1]
                });
                j = j + 2;
            }
        }
        return playerInfo;
    }
    public async updatePlayerInfo(playChannelName, playerInfo, newSession) {
        const pipeline = await this.redisManger.pipeline();
        // pipeline.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        pipeline.del(GameRedis.LIST_PA_POOL + playChannelName);
        await pipeline.exec();
        const pipeline2 = await this.redisManger.pipeline();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0 ; i < playerInfo.length; i++) {
            pipeline2.hincrbyfloat(GameRedis.HASH_PLAYERINFO + playerInfo[i].id, 'handsAmount',
            _.toNumber(playerInfo[i].turnMoney));
        }
        pipeline2.hmset(GameRedis.HASH_DESKINFO + playChannelName, {
            deskMoney: 0,
            session: newSession
        });
        await pipeline2.exec();
        const pipeline3 = await this.redisManger.pipeline();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0 ; i < playerInfo.length; i++) {
            pipeline3.hmget(GameRedis.HASH_PLAYERINFO + playerInfo[i].id, 'seat', 'handsAmount');
        }
        /**
         * [ [ null, [ '2', '0' ] ],
         * [ null, [ '1', '0' ] ],
         * [ null, [ '3', '0' ] ],
         * [ null, [ '0', '26964' ] ] ]
         */
        const res = await pipeline3.exec();
        const pipeline4 = await this.redisManger.pipeline();
        // 更新玩家的錢
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0 ; i < res.length; i++) {
            const updateDesk = Utils.getPipelineOneArray(res[i]);
            pipeline4.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, _.toNumber(updateDesk[0]), updateDesk[1]);
        }
        // 新桌控制 1 => 不能開新桌 0 => 可以開新桌
        // pipeline4.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'deskStatus', 0);
        return pipeline4.exec();
    }

    public async getSession(game: number) {
        const res =  await this.sqlManager.callSP
        ('CALL insert_club_session(?)', [game]);
        return _.toNumber(res[0].id);
    }

    public async getOutTableNoKick(playChannelName: string, newSession, dBigCost) {
        const lookPlayer = await  this.redisManger.hgetall(GameRedis.HASH_LOOK_PLAYER + playChannelName);
        const playerList = Utils.getHgetAllKeyValue(lookPlayer);
        const playerID = playerList.keyName;
        const playerCode = playerList.valueName;
        const playerIdList: any = [];
        const playerNoMoney: any = [];
        const pipeline = await this.redisManger.pipeline();
        for (let i = 0; i < playerCode.length; i ++) {
            pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID[i],
                'action', 'sessionRecordID', 'seat', 'amount', 'handsAmount', 'table');
            playerIdList.push(playerID[i]);
        }
        const res = await pipeline.exec();
        let deskPeople = 0;
        const pipeline2 = await this.redisManger.pipeline();
        const pipeline3 = await this.redisManger.pipeline();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.length; i ++) {
            const playerInfo =  Utils.getPipelineOneArray(res[i]);
            const seat = _.toNumber(playerInfo[2]);
            const action = _.toNumber(playerInfo[0]);
            const session = _.toNumber(playerInfo[1]);
            const handsAmount =  _.toNumber(playerInfo[4]);
            const amount =  _.toNumber(playerInfo[3]);
            const table =  playerInfo[5];
            const BigCost = _.toNumber(dBigCost);
            const playerAmount = new BigNumber(amount).plus(handsAmount).toNumber();
            pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerID[i], 'sessionRecordID', newSession);
            pipeline3.del(GameRedis.LIST_ALLIN_BET + playChannelName);
            pipeline3.del(GameRedis.HASH_FRONT_BET + playChannelName);
            pipeline3.del(GameRedis.LIST_PUBLIC_POKER + playChannelName);
            pipeline3.del(GameRedis.LIST_PA_POOL + playChannelName);
            // 我沒有錢被踢掉
            if (handsAmount < BigCost && seat !== Constant.PLAYER_NO_SEAT_N && action !== Constant.NO_ACTION) {
                if (amount >= BigCost) { // 還有救
                    playerNoMoney.push(playerID[i]);
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i], {
                        handsAmount: Constant.INIT
                    });
                    pipeline3.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName,
                        seat, Constant.NO_ACTION);
                    pipeline3.lset(GameRedis.LIST_PLAYER_POINT + playChannelName,
                        seat, Constant.INIT);
                } else if (amount < BigCost) {
                    // amount 小於 大盲 踢掉
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i], {
                        sessionRecordID: newSession,
                        countDown: Constant.INIT,
                        insurance: Constant.INIT,
                        amount: playerAmount,
                        handsAmount: Constant.INIT,
                        action: Constant.STATUS_NO_BET
                    });
                    pipeline3.hset(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerIdList[i],
                        Constant.LOOKING_PLAYER);
                    pipeline3.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName,
                        seat, Constant.NO_ACTION);
                    pipeline3.lset(GameRedis.LIST_PLAYER_POINT + playChannelName,
                        seat, Constant.INIT);
                    pipeline3.lset(GameRedis.LIST_PLAYER_SIT + playChannelName,
                        seat, Constant.INIT);
                    pipeline3.lset(GameRedis.LIST_PLAYING_PLAYER + playChannelName,
                        seat, Constant.INIT);
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i],
                        'seat', Constant.PLAYER_SEAT_INIT);
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i],
                            'action', Constant.STATUS_LOOK);
                }
                pipeline3.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, seat, Constant.NO_ACTION);
                pipeline3.hincrby(GameRedis.HASH_DESKINFO + playChannelName,
                                            'deskPeople', Constant.SUB_PLAYER_LEAVE);
                pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i], {
                    action: Constant.NO_ACTION
                });
            }
            if (handsAmount >= BigCost && seat !== Constant.PLAYER_NO_SEAT_N &&
                action !== Constant.DISCONNECT_PLAYER &&
                table === playChannelName) {
                deskPeople ++;
                if (action !== Constant.STATUS_WAITBIG) {
                    pipeline3.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, seat, Constant.NEED_TO_ACTION);
                }
            }
            // 踢掉不是在這桌的人
            if (table !== playChannelName) {
                pipeline3.hdel(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerIdList[i]);
            }
            // 斷線
            if (action === Constant.DISCONNECT_PLAYER &&
                session !== Constant.INIT) {
                pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i], {
                    sessionRecordID: newSession,
                    costTime: Constant.INIT,
                    bet: Constant.INIT,
                    countDown: Constant.INIT,
                    insurance: Constant.INIT,
                    handsAmount: Constant.INIT,
                    action: 0
                });
                pipeline3.hdel(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerIdList[i]);
                if (seat !== Constant.PLAYER_NO_SEAT_N) {
                    pipeline3.hincrbyfloat(GameRedis.HASH_DESKINFO + playChannelName,
                        'deskPeople', Constant.SUB_PLAYER_LEAVE);
                    // pipelineDesk.hmset(GameRedis.HASH_FRONT_BET + playChannelName,
                    //     playerIdList[i], Constant.NO_ACTION);
                    pipeline3.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName,
                        seat, Constant.NO_ACTION);
                    pipeline3.lset(GameRedis.LIST_PLAYER_POINT + playChannelName,
                        seat, Constant.INIT);
                    pipeline3.lset(GameRedis.LIST_PLAYER_SIT + playChannelName,
                        seat, Constant.INIT);
                    pipeline3.lset(GameRedis.LIST_PLAYING_PLAYER + playChannelName,
                        seat, Constant.INIT);
                    // ----
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i],
                        'seat', Constant.PLAYER_SEAT_INIT);
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i],
                        'action', Constant.STATUS_LOOK);
                    pipeline2.hmset(GameRedis.HASH_PLAYERINFO + playerIdList[i],
                        'amount', playerAmount);
                }
            }
        }
        pipeline3.hset(GameRedis.HASH_DESKINFO + playChannelName, 'deskPeople', deskPeople);
        await Promise.all([pipeline2.exec(), pipeline3.exec()]);
        return playerNoMoney;
    }

    public async getDeskInfo2(playChannelName: string): Promise<{
        playerSit,
        playerName,
        playerPoint,
        gameStart}> {
        // 新桌控制 1 => 不能開新桌 0 => 可以開新桌
        // pipeline4.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'deskStatus', 0);
        await this.redisManger.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'deskStatus', 0);
        await this.redisManger.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline   // [null,[0,0,0,0,0,0,0]]
        .lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYING_PLAYER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1)
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
    /**
     * @param session
     * @param end_time
     * @param hour
     * @param pot
     * @param proxy_pot
     * @param dealer
     * @param winner
     * @param public_card
     * @param insurance_bet
     */
    public async updateSession(
        session: string,
        end_time,
        hour,
        pot,
        dealer,
        winner,
        public_card,
        insurance_bet): Promise<any> {
        const data = {
            id: session,
            end_time,
            hour,
            pot,
            dealer,
            winner,
            public_card,
            insurance_bet
        };
        await this.sqlManager.callSP
        ('CALL update_club_session(?)', [JSON.stringify(data)]);
    }
}
