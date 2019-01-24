import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameIntoRoomRepository')
export default class GameIntoRoomRepository extends BaseRepository {
    constructor() { super(); }
    public async getDeskList() {
        return this.redisManger.lrange(GameRedis.DESK_PLAYING, 0 , -1);
    }
    // public async getPlayerRedisSession(memberId): Promise<any> {
    //     const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
    //     return res[0] || 0;
    // }
    public async getDeskSession(playChannelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'session');
        return res[0] || 0;
    }

    public async getplayerAction(playerID): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playerID, 'action');
        return res[0] || 0;
    }

    // 拿全部桌子資料
    public async deskPreTime(playChannelName, time): Promise<{
        preTime,
        seatSpace,
        deskStatus}
    > {
        const res =
        await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName,
        'preTime',
        'seatSpace',
        'deskStatus');
        return {
            preTime: res[0] || time,
            seatSpace: res[1],
            deskStatus: _.toNumber(res[2])
        };
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
    public async getDeskInfo(playChannelName: string, playerID: string, time) {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline   // [null,[0,0,0,0,0,0,0]]
        .hgetall(GameRedis.HASH_DESKINFO + playChannelName)
        .hgetall(GameRedis.HASH_FRONT_BET + playChannelName)
        .lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYING_PLAYER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1)
        .hmset(GameRedis.HASH_LOOK_PLAYER + playChannelName, playerID, Constant.LOOKING_PLAYER)
        .hmset(GameRedis.HASH_DESKINFO + playChannelName, {
            preTime: time
        })
        .exec();
        const [deskInfo,
            frontBet,
            playerSit,
            playerName,
            publicPoker,
            playerAction,
            playerPoint,
            lookPlayer] = Utils.getPipelineData(res);
        let retPoker ;
        switch (_.toNumber(deskInfo.round)) {
            case 1:
                retPoker = _.take(publicPoker, 0);
                break;
            case 2:
                retPoker = _.take(publicPoker, 3);
                break;
            case 3:
                retPoker = _.take(publicPoker, 4);
                break;
            case 4:
                retPoker = _.take(publicPoker, 5);
                break;
        }
        const frontBetList = Utils.getHgetAllKeyValue(frontBet);
        let costRoundMoney ;
        for (const betMoney of frontBetList.valueName) {
            if (betMoney !== Constant.NO_PLAYER_S) {
                costRoundMoney += _.toNumber(betMoney);
            }
        }
        return {
            dHost: deskInfo.dHost,
            dbig: deskInfo.dBig,
            dsmall: deskInfo.dSmall,
            deskMoney: deskInfo.deskMoney,
            round: deskInfo.round,
            nowPlayer: deskInfo.nowPlayer,
            deskPeople: deskInfo.seatSpace,
            playerSit,
            playerName,
            publicPoker: retPoker,
            playerAction,
            playerPoint,
            playerCountDown: deskInfo.playerCountDown,
            costRoundMoney,
            frontBetList,
            playerBet: frontBetList.valueName,
            protocol: GameSend.PROTOCOL_INTO_ROOM
        };
    }
    public async initPlayer(
        playerID: string,
        playChannelName: string,
        session: string,
        playerCountDown
        ) {
            const pipeline = await this.redisManger.pipeline();
            pipeline.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
                table: playChannelName,
                sessionRecordID: session,
                roundStatusID: -1,
                channelName: playChannelName,
                seat: -1,
                handsAmount: -1,
                costBet: 0,
                castTime: 0,
                bet: -1,
                action: Constant.STATUS_LOOK,
                countDown: playerCountDown,
                deskBetPool: -1,
                insurance: -1
            });
            return pipeline.exec();
    }
}
