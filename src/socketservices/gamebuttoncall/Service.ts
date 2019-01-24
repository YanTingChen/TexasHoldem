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

@provide('GameButtonCallServer')
export default class GameButtonCallServer extends BaseService {
    constructor(@inject('GameButtonCallRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer,
    @inject('GameButtonAllinServer') private gameButtonAllin: GameButtonAllinServer) { super(); }

    public async dealCallAction(
        playerID: string,
        playChannelName: string,
        costTime: string | number,
        systemAction = false
    ): Promise<any> {
        // 檢查session
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
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
        // 檢查錢是否小於跟注金額 如果小於 去執行 allin流程
        if (new BigNumber(getPlayerInfo.handsAmount).lt(getNowDesk.frontBet)) {
            return this.gameButtonAllin.dealAllinAction(playerID, playChannelName);
        }
        await this.repository.setCountDownerControl(playChannelName);
        const frontDeskMoney = _.toNumber(getNowDesk.frontDeskMoney);
        const frontMoney = _.toNumber(getNowDesk.frontBet); // 100
        const needCostMoney = new BigNumber(frontDeskMoney).minus(frontMoney).toNumber();
        const dealFinishMoney = await this.repository.setPlayerInfo(playerID, needCostMoney, getNowDesk.countDown);
        const newCallMoney = await this.repository.setDeskInfo(
            playChannelName,
            frontMoney,
            _.toNumber(getPlayerInfo.seat),
            playerID,
            needCostMoney,
            dealFinishMoney
        );
        const playerPoint = await this.repository.playerPoint(playChannelName);
        const data = {
            protocol: 2,
            seat: getNowDesk.nowPlayer,
            needCostMoney: newCallMoney,
            action: Constant.STATUS_CALL,
            playerPoint
        };
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
        //  playerReord
        await this.GameRound.dealDeskAction(playChannelName);
        return this.repository.playerInfo(playChannelName, playerID, getNowDesk.deskMoney, '0');
    }
}
