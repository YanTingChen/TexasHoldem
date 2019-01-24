import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonFoldServer')
export default class GameButtonFoldServer extends BaseService {
    constructor(@inject('GameButtonFoldRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer) { super(); }

    public async dealFoldAction(
        playerID: string,
        playChannelName: string,
        costTime: string | number,
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
        const getNowDesk = await this.repository.getNowDesk(playChannelName);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 判斷動作是否是 等待中
        if (getPlayerInfo.action === Constant.STATUS_LOOK) {
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_ACTION');
        }
        // 玩家的位置是否和要動作的玩家一致
        if (getNowDesk.nowPlayer !== getPlayerInfo.seat ||
            getPlayerInfo.seat === Constant.PLAYER_SEAT_INIT) { // 6
            const error = {
                code: 100004
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        await this.repository.setCountDownerControl(playChannelName);
        // 系統幫忙
        // if (!systemAction) {
        //     // 紀錄action時間
        // }
        let action = Constant.STATUS_FOLD;
        // 如果玩家的action 是離開 那不改變其狀態
        if (getPlayerInfo.action === Constant.PLAYER_LEAVE_ACTION) {
            action = Constant.PLAYER_LEAVE_ACTION;
        }
        // 如果玩家的action 是斷線 那不改變其狀態
        if (getPlayerInfo.action === Constant.DISCONNECT_PLAYER) {
            action = Constant.DISCONNECT_PLAYER;
        }
        const playerPoint = await this.repository.playerPoint(playChannelName);
        const data = {
            protocol: 2,
            seat: getNowDesk.nowPlayer ,
            action: Constant.STATUS_FOLD,
            needCostMoney: 0,
            playerPoint
        };
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
        // 棄排動作
        await this.repository.dealPlayer(playerID, costTime, getNowDesk.countDown, action);
        await this.repository.dealDesk(playChannelName, _.toNumber(getPlayerInfo.seat), playerID);
        await this.GameRound.dealDeskAction(playChannelName);
        //  playerReord
        return this.repository.playerInfo(playChannelName, playerID, getNowDesk.deskMoney, '0');
    }
}
