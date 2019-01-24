import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import GameRoundServer from '../gameproceround/Service';
import GameSharePaServer from '../gamesharepa/Service';
import Repository from './Repository';

@provide('GameButtonMenuServer')
export default class GameButtonMenuServer extends BaseService {
    constructor(@inject('GameButtonMenuRepository') private repository: Repository,
    @inject('GameSharePaServer') private gamesharepa: GameSharePaServer,
    @inject('GameRoundServer') private GameRound: GameRoundServer) { super(); }

    public async leaveSeat(
        playerID: string,
        playChannelName: string
    ): Promise<any> {
        // 檢查session
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 檢查玩家是否有坐位置
        if (getPlayerInfo.seat === Constant.PLAYER_SEAT_INIT) {
            throw new Exceptions(9001, 'member: ' + playerID + 'NOT_ON_POSITION');
        }
        let playerAmount: any = getPlayerInfo.amount;
        playerAmount = new BigNumber(playerAmount).plus(getPlayerInfo.handsAmount).toNumber();
        // 更新離開位置後, 牌桌及玩家資訊
        await this.repository.updateLeaveSeat(playChannelName, getPlayerInfo.seat, playerID, playerAmount);
        // 傳送房間最新資訊給此房間所有玩家
        // const deskInfo = await this.repository.getDeskInfo(playChannelName);
        // await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, deskInfo);
        return ;
    }
    public async leaveDesk(
        playerID: string,
        playChannelName: string,
        costTime: string | number
    ): Promise<any> {
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        const getDeskStatusInfo = await this.repository.getDeskStatusInfo(playChannelName);
        // 檢查是否同一桌
        if (getPlayerInfo.desk !== playChannelName) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        let playerAmount: any = getPlayerInfo.amount;
        const reDate = {
            code: Constant.PLAYER_LEAVE_SUCCESS
        };
        playerAmount = new BigNumber(playerAmount).plus(getPlayerInfo.handsAmount).toNumber();
        if (getPlayerInfo.seat !== Constant.PLAYER_NO_SEAT_N) {
            const getPlayerSit = await this.repository.getPlayerSit(
                playChannelName,
                getPlayerInfo.seat,
                playerID,
                playerAmount,
                getPlayerInfo.action);
            // const getDeskStatusInfo = await this.repository.getDeskStatusInfo(playChannelName);
            if (_.toNumber(getDeskStatusInfo.deskStatus) ===  Constant.GAME_IS_PLAYING) {
                const processDeskAction: any = Utils.playerActionTotal(getPlayerSit.playerAction);
                const DeskSeatSpace = _.toNumber(getPlayerSit.seatSpace);
                if ((processDeskAction[0] === DeskSeatSpace) ||
                    (processDeskAction[0] === DeskSeatSpace - 1 &&  processDeskAction[1] === 1) ||
                    (processDeskAction[4] === DeskSeatSpace - 1 &&  processDeskAction[2] === 1)
                    ) {
                    await this.repository.setCountDownerControl(playChannelName);
                    // 分錢 第一個狀況所有人allin or 棄牌 含沒有動作的玩家
                    // No.2 剩一個人跟注 其他人allin或棄牌 含沒有動作的玩家
                    await this.gamesharepa.dealPot(playChannelName);
                    await this.gamesharepa.dealSharePa(playChannelName);
                    return this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, reDate);
                }
            }
            if (_.toString(getDeskStatusInfo.nowPleyerID) === _.toString(playerID) &&
                _.toNumber(getDeskStatusInfo.deskStatus) ===  Constant.GAME_IS_PLAYING) {
                await this.repository.setCountDownerControl(playChannelName);
                await this.GameRound.dealDeskAction(playChannelName);
                // 傳送房間資訊給此房間所有玩家
                const deskInfo = await this.repository.getDeskInfo(playChannelName);
                await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, deskInfo);

                return this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, reDate);
            }
            // 傳送房間資訊給此房間所有玩家
            const deskInfo2 = await this.repository.getDeskInfo(playChannelName);
            await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, deskInfo2);

        }
        // 玩家有坐位置, 更新離位後的牌桌&玩家資訊 Socket_TexasHoldem
        // 玩家沒有座位 (不含action.seat)
        if  (getPlayerInfo.seat === Constant.PLAYER_SEAT_INIT) {
            await this.repository.updatePlayerInfo(playerID, _.toNumber(playerAmount), playChannelName);
        }
        return this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, reDate);
    }

    public async cancelWaitBig(
        playerID: string,
        playChannelName: string,
        session: string,
        costTime: string | number,
        systemAction = false
    ): Promise<any> {
        // 檢查session
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        await this.repository.setPlayerAction(playerID);
        return ;
    }
}
