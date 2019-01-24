import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonAllinServer')
export default class GameButtonAllinServer extends BaseService {
    constructor(@inject('GameButtonAllinRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer) { super(); }

    public async dealAllinAction(
        playerID: string,
        playChannelName: string
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
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 玩家的位置是否和要動作的玩家一致
        if (getDeskInfo.nowPlayer !== getPlayerInfo.seat) {
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_CHECK');
        }
        // 判斷動作是否是 等待中
        if (_.toNumber(getPlayerInfo.action) === Constant.STATUS_LOOK) {
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_ACTION');
        }
        await this.repository.setCountDownerControl(playChannelName);
        // 拿出之前下的金額
        const handsAmount =  await this.repository.getBet(playChannelName, playerID, getPlayerInfo.handsAmount);
        const getAllPlayerInfo = await this.repository.getAllPlayerInfo(playChannelName);
        const frontBet = getAllPlayerInfo.frontBet;
        const playerSit = getAllPlayerInfo.playerSit;
        const playerAction = getAllPlayerInfo.playerAction;
        let frontMoney = getDeskInfo.frontMoney;
        let newRaiseMoney: any = 0;
        const needChangePlayer: any = [];
        // 找出錢少於allin 金額、不是allin和棄排的其他玩家 要改action
        // tslint:disable-next-line:only-arrow-functions
        _.forEach(frontBet, function(value, key) {
            if (_.toNumber(value) < handsAmount) {
                const sit =  _.indexOf(playerSit, key);
                if (_.toNumber(playerAction[sit]) < 50) {
                    needChangePlayer.push(sit);
                }
            }
        });
        // 如果前大於 最低跟注金額 需改變 其他玩家的最低跟注金額 和 加注金額
        if (new BigNumber(handsAmount).gt(frontMoney)) {
            newRaiseMoney = new BigNumber(handsAmount).multipliedBy(2);
            newRaiseMoney = new BigNumber(newRaiseMoney).minus(frontMoney);
            frontMoney = handsAmount;
        }
        await this.repository.setPlayerInfo(playerID, getPlayerInfo.handsAmount, getDeskInfo.countDown);
        await this.repository.setDeskInfo(
            playChannelName,
            getPlayerInfo.handsAmount,
            _.toNumber(getPlayerInfo.seat),
            needChangePlayer,
            handsAmount,
            frontMoney,
            newRaiseMoney);

        const getDeskMoney = await this.repository.getDeskMoney(playChannelName);
        const data = {
            protocol: 2,
            seat: getDeskInfo.nowPlayer,
            action: Constant.STATUS_ALLIN,
            needCostMoney: getPlayerInfo.handsAmount,
            playerPoint: getDeskMoney.playerPoint
        };
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
        await this.repository.playerInfo(playChannelName, playerID, getDeskMoney.deskMoney, '0'); // 修改 time
        await this.GameRound.dealDeskAction(playChannelName);
        return;
    }
}
