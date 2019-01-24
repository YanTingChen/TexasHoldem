import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameButtonFoldServer from '../gamebuttonfold/Service';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonCheckServer')
export default class GameButtonCheckServer extends BaseService {
    constructor(@inject('GameButtonCheckRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer,
    @inject('GameButtonFoldServer') private gameButtonFold: GameButtonFoldServer) { super(); }

    public async dealCheckAction(
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
        const getNowDesk = await this.repository.getDeskInfo(playChannelName);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 玩家的位置是否和要動作的玩家一致
        if (getNowDesk.nowPlayer !== getPlayerInfo.seat) {
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
        // 如果action是離開座位 就去執行棄排流程
        if (getPlayerInfo.action === Constant.PLAYER_LEAVE_ACTION) {
            return this.gameButtonFold.dealFoldAction(playerID, playChannelName, costTime);
        }
        await this.repository.setCountDownerControl(playChannelName);
        const getPlayerPoint = await this.repository.getPlayerPoint(playChannelName, playerID);
        const frontMoney = new BigNumber(getNowDesk.frontMoney);
        // 確認金錢
        if (frontMoney.gt(getPlayerPoint)) {
            const error = {
                code: 100012
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        let action = Constant.STATUS_CHECK;
        // 如果玩家的action 是離開 那不改變其狀態
        if (getPlayerInfo.action === Constant.PLAYER_LEAVE_ACTION) {
            action = Constant.PLAYER_LEAVE_ACTION;
        }
        // 如果玩家的action 是斷線 那不改變其狀態
        if (getPlayerInfo.action === Constant.DISCONNECT_PLAYER) {
            action = Constant.DISCONNECT_PLAYER;
        }
        const playerPoint = await this.repository.playerPoint(playChannelName);
        // 桌子目前要動作的玩家
        const data = {
            protocol: 2,
            seat: getNowDesk.nowPlayer ,
            action: Constant.STATUS_CHECK,
            needCostMoney: 0,
            playerPoint
        };
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
        // 如果FrontMoney為0時
        await this.repository.setDeakInfo(playChannelName, _.toNumber(getPlayerInfo.seat));
        await this.repository.setPlayerInfo(playerID, costTime, getNowDesk.countDown, action);
        await this.GameRound.dealDeskAction(playChannelName);
        //  playerReord
        await this.repository.playerInfo(playChannelName, playerID, getNowDesk.deskMoney, '0');
        return ;
    }
}
