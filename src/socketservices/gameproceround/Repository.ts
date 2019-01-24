import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameRoundRepository')
export default class GameRoundRepository extends BaseRepository {
    constructor() { super(); }

    public async getRoundAction(playChannelName: string)
                : Promise<{playerAction, seatSpace, round, nowPlayer, playerSit,
                    playerSitNoPosition, dhost, dBigCost}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'seatSpace');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'round');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'dHost');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'dBigCost');
        const res = await pipeline.exec();
        const [playerAction, seatSpace, round, nowPlayer, playerSit, dhost, dBigCost] = Utils.getPipelineData(res);
        return{
            playerAction,
            seatSpace,
            round: _.toNumber(round),
            nowPlayer,
            playerSit: Utils.findPlaySitPosition(playerSit),
            playerSitNoPosition: playerSit,
            dhost,
            dBigCost
        };
    }
    public async getPlayerAction(playChannelName: string): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        const lookHashPlayer = await this.redisManger.hgetall(GameRedis.HASH_LOOK_PLAYER + playChannelName);
        return ;
    }
    // 設定下一round
    public async setHashPoint(channelName: string, playerSit, playerAction, dBigCost): Promise<any> {
        const frontHash = await this.redisManger.hgetall(GameRedis.HASH_FRONT_BET + channelName);
        const playerfrontHash = Utils.getHgetAllKeyValue(frontHash);
        const playerLength = playerfrontHash.keyName.length;
        const pipeline = await this.redisManger.pipeline();
        for (let i = 0; i < playerLength; i++) {
            if (_.toNumber(playerfrontHash.valueName[i]) !== Constant.NO_SHARE_PA) {
                pipeline.hmset(GameRedis.HASH_FRONT_BET + channelName, playerfrontHash.keyName[i], 0);
            }
        }
        // for (const data of playerSit) {
        //     pipeline.hmset(GameRedis.HASH_FRONT_BET + channelName, data.playerId, 0);
        // }
        // tslint:disable-next-line:prefer-for-of
        for (let  i = 0; i < playerAction.length; i++) {
            if (playerAction[i] < 50) {
                pipeline.lset(GameRedis.LIST_PLAYER_ACTION + channelName, i, 0);
            }
        }
        pipeline.hincrby(GameRedis.HASH_DESKINFO + channelName, 'round', 1);
        pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, 'frontMoney', 0);
        pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, 'raiseMoney', dBigCost);
        return pipeline.exec();
    }
    public async setNextPlayer(channelName: string, nextPlayer) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, {
            nowPlayer: nextPlayer
        });
        pipeline.lindex(GameRedis.LIST_PLAYER_SIT + channelName, nextPlayer);
        const res = await pipeline.exec();
        const [ , nextPlayerID] = Utils.getPipelineData(res);
        return nextPlayerID;
    }
    public async getNextPlayerInfo(nextPlayerID: string): Promise<any> {
        return this.redisManger.hgetall(GameRedis.HASH_PLAYERINFO + nextPlayerID);
    }

    public async getDeskInfo(playChannelName, nextPlayerID): Promise <{
        host,
        dBig,
        deskMoney,
        round,
        frontMoney,
        nowPlayer
        paPool,
        publicPoker,
        playerBetHash,
        costRoundMoney,
        raiseMoney,
        nextPlayerFrontBet,
        playerSit}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName,
            'dHost', 'deskMoney', 'round', 'frontMoney', 'nowPlayer', 'dBig', 'raiseMoney'
        );
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1);
        pipeline.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.hmget(GameRedis.HASH_FRONT_BET + playChannelName, nextPlayerID);
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0 , -1);
        const res = await pipeline.exec();
        const [
            [host, deskMoney, round, frontMoney, nowPlayer, dBig, raiseMoney],
            paPool,
            publicPoker,
            del,
            frontBet,
            nextPlayerFrontBet,
            playerSit
        ] = Utils.getPipelineData(res);
        // frontBetfrontBetfrontBet::::  { '90366': '0', '97699': '200' }
        // playerBetHashplayerBetHash::::  { keyName: [ '90366', '97699' ], valueName: [ '0', '200' ] }
        if (paPool.length === 0) {
            paPool.push(deskMoney);
        }
        const playerBetHash = Utils.getHgetAllKeyValue(frontBet);
        let costRoundMoney = 0;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playerBetHash.valueName.length; i++) {
            if (_.toNumber(playerBetHash.valueName[i]) > 0) {
                costRoundMoney += _.toNumber(playerBetHash.valueName[i]);
            }
        }

        return {
            host,
            dBig,
            deskMoney,
            round,
            frontMoney,
            nowPlayer,
            paPool,
            publicPoker,
            playerBetHash,
            costRoundMoney,
            raiseMoney,
            nextPlayerFrontBet,
            playerSit
        };
    }
    public async getPlayerInfo(playerSit, playerBetHash): Promise <{playerID, handsAmount, seat}> {
        const pipeline = await this.redisManger.pipeline();
        // playerBetHash  { keyName: [ '90366', '97699' ], valueName: [ '0', '0' ] }
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playerSit.length; i++) {
            if (playerSit[i] !== '-1') {
                pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerSit[i], 'handsAmount', 'seat');
            }
        }
        const res = await pipeline.exec();
        const playerInfo: any = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0, j = 0; i < playerSit.length; i++) {
            if (playerSit[i] !== '-1') {
                const [handsAmount, seat ] = Utils.getPipelineOneArray(res[j]);
                const findCost = _.indexOf(playerBetHash.keyName, playerSit[i]);
                playerInfo.push({
                    playerID: playerSit[i],
                    handsAmount,
                    seat
                });
                j++;
            }
        }
        return playerInfo;
    }

    public async setPlayerButton(playerId, allin, check, raise, call, bet): Promise<any> {
        await this.redisManger.rpush(GameRedis.LIST_BUTTON + playerId, allin, check, raise, call, bet);
        return ;
    }

    public async countDownerControl(playChannelName: string): Promise<any> {
        await this.redisManger.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'countDownerControl', 1);
        return ;
    }
}
