import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameConnectRepository')
export default class GameConnectRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }

    public async getPlayerInfo(playerId: string): Promise<any> {
        return this.redisManger.hgetall(GameRedis.HASH_PLAYERINFO + playerId);
    }

    public async getPlayerButton(playerId: string): Promise<any> {
        await this.redisManger.hmset(GameRedis.HASH_PLAYERINFO + playerId, 'action', Constant.STATUS_ACTION);
        return this.redisManger.lrange(GameRedis.LIST_BUTTON + playerId, 0, -1);
    }
    public async getDeskInfo(playChannelName: string, playerID: string, button) {
        const playerPokers = await this.redisManger.lrange(GameRedis.LIST_POKER + playerID, 0, -1);
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
        .exec();
        const [deskInfo,
            frontBet,
            playerSit,
            playerName,
            publicPoker,
            playerAction,
            playerPoint,
            lookPlayer] = Utils.getPipelineData(res);
        const frontBetList = Utils.getHgetAllKeyValue(frontBet);
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
        let costRoundMoney ;
        for (const betMoney of frontBetList.valueName) {
            if (betMoney !== Constant.NO_PLAYER_S) {
                costRoundMoney += _.toNumber(betMoney);
            }
        }
        return {
            playerPokers,
            button,
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
            protocol: GameSend.PROTOCOL_INTO_ROOM,
            gameStart: 1
        };
    }
}
