import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameButtonAllinServer from '../gamebuttonallin/Service';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonRaiseServer')
export default class GameButtonRaiseServer extends BaseService {
    constructor(@inject('GameButtonRaiseRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer,
    @inject('GameButtonAllinServer') private gameButtonAllin: GameButtonAllinServer) { super(); }

    public async dealRaiseAction(
        playerID: string,
        playChannelName: string,
        costTime: string | number,
        costBet,
        systemAction = false
    ): Promise<any> {
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        // 檢查session
        if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
            const error = {
                code: 100003
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        // 桌子目前要動作的玩家
        const getNowDesk = await this.repository.getNowDesk(playChannelName, playerID);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 判斷動作是否是 等待中
        if (_.toNumber(getPlayerInfo.action) === Constant.STATUS_LOOK) {
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_ACTION');
        }
        // 玩家的位置是否和要動作的玩家一致
        if (getNowDesk.nowPlayer !== getPlayerInfo.seat) { // 6
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        // 如果錢不足最低加注金額
        if (new BigNumber(costBet).lt(getNowDesk.raiseMoney)) {
            const error = {
                code: 100013
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' RAISE_MONEY_NOT_ENOUGH');
        }
        // 設定搶倒數玩家
        await this.repository.setCountDownerControl(playChannelName);
        // 更新最低跟注金額 & 最低加注金額
        if (new BigNumber(getPlayerInfo.handsAmount).lt(costBet)) {
            return this.gameButtonAllin.dealAllinAction(playerID, playChannelName);
        }
        const getFrontHash = await this.repository.getFrontHash(playerID, playChannelName, costBet);
        const frontMoney = _.toNumber(getNowDesk.frontMoney);
        // Redis frontBet增加玩家下注金額
        const frontBetHash = _.toNumber(getFrontHash.frontBetHash);
        const allFrontBetHash: any = getFrontHash.allFrontBetHash;
        const playerSit: any = getNowDesk.playerSit;
        const playerAction: any = getNowDesk.playerAction;
        /**
         * 下一位最低加注金額   下一位加注金額 = 目前加注金額*2扣除 最低跟注金額
         */
        let newRaiseMoney: any  = new BigNumber(frontBetHash).multipliedBy(2);
        newRaiseMoney = new BigNumber(newRaiseMoney).minus(frontMoney).toNumber();
        const needChangePlayer: any = []; // action需要改變的玩家
        // tslint:disable-next-line:only-arrow-functions
        _.forEach(allFrontBetHash, function(value, key) {
            if (new BigNumber(value).lt(frontBetHash)) {
                const sit =  _.indexOf(playerSit, key);
                if (playerAction[sit] < Constant.PLAYER_ACTION_ALLIN && playerID !== key) {
                    needChangePlayer.push(sit);
                }
            }
        });
        // 系統幫忙
        if (!systemAction) {
            // 紀錄action時間
        }
        // 要改變action的玩家列表 needChangePlayer 玩家Bet frontB玩家Bet frontMoney -> frontBetHash raiseMoney -> newRaiseMoney
        const dealFinishMoney = await this.repository.setPlayerInfo(
            playerID, frontBetHash, getNowDesk.countDown, costBet);
        await this.repository.setDeskInfo(
            playChannelName,
            _.toNumber(getPlayerInfo.seat),
            costBet,
            dealFinishMoney,
            needChangePlayer,
            newRaiseMoney,
            frontBetHash
        );
        let action = Constant.STATUS_RAISE;
        if (frontMoney === 0) {
            action =  Constant.STATUS_BET;
        }
        const playerPoint = await this.repository.playerPoint(playChannelName);
        const data = {
            protocol: 2,
            seat: getNowDesk.nowPlayer ,
            action,
            needCostMoney: frontBetHash,
            playerPoint
        };
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
        //  playerReord
        await this.GameRound.dealDeskAction(playChannelName);
        return this.repository.playerInfo(playChannelName, playerID, getNowDesk.deskMoney, '0');
    }
}
