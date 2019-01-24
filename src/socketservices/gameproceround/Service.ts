import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GHeartbeats from '../../models/GHeartbeats';
import Utils from '../../utils/Utils';
import GameSharePaServer from '../gamesharepa/Service';
import Repository from './Repository';

@provide('GameRoundServer')
export default class GameRoundServer extends BaseService {
    constructor(@inject('GameRoundRepository') private repository: Repository,
    @inject('GameSharePaServer') private gamesharepa: GameSharePaServer) { super(); }

    public async dealDeskAction(
        playChannelName: string
    ): Promise<any> {
        const getRoundAction = await this.repository.getRoundAction(playChannelName);
        // const getPlayerAction = await this.repository.getPlayerAction(playChannelName);
        const playerAction = getRoundAction.playerAction;
        /**
         * processDeskAction[0] = 沒有動作 or allin
         * processDeskAction[1] = call and raise check
         * processDeskAction[2] = 阿茲剩一個人
         * processDeskAction[3] = 總total
         * processDeskAction[3] = 放棄牌
         */
        const processDeskAction: any = Utils.playerActionTotal(playerAction);
        const DeskSeatSpace = _.toNumber(getRoundAction.seatSpace);
        const playerSit = getRoundAction.playerSit;
        if (processDeskAction[3] === DeskSeatSpace && getRoundAction.round === Constant.SHARE_POT_ROUND) {
            // 分錢 round = 4 和 大家動作同意一致 所以分pot
            await this.gamesharepa.dealPot(playChannelName);
            await this.gamesharepa.dealSharePa(playChannelName);
            return;
        }
        if ((processDeskAction[0] === DeskSeatSpace) ||
            (processDeskAction[0] === DeskSeatSpace - 1 &&  processDeskAction[1] === 1) ||
            (processDeskAction[4] === DeskSeatSpace - 1 &&  processDeskAction[2] === 1)
            ) {
            // 分錢 第一個狀況所有人allin or 棄牌 含沒有動作的玩家
            // No.2 剩一個人跟注 其他人allin或棄牌 含沒有動作的玩家
            await this.gamesharepa.dealPot(playChannelName);
            await this.gamesharepa.dealSharePa(playChannelName);
            return;
        }
        let nextPlayer = -1;
        if (processDeskAction[3] === DeskSeatSpace) {
            // 執行下一round
            let buttonPosition = _.toNumber(getRoundAction.dhost);
            // tslint:disable-next-line:prefer-conditional-expression
            // if (buttonPosition + 1 >= DeskSeatSpace) {
            //     buttonPosition = 0;
            // } else {
            //     buttonPosition = buttonPosition + 1;
            // }
            buttonPosition = Utils.exceededLength(buttonPosition, DeskSeatSpace);
            for (let i = buttonPosition; i < DeskSeatSpace; i++) { // [100,100,100,0,100,100,100,100,30]
                const action = _.toNumber(playerAction[i]);
                if (action !== Constant.PLAYER_ACTION_FOLD &&
                    action !== Constant.PLAYER_LEAVE_ACTION &&
                    action !== Constant.PLAYER_ACTION_ALLIN &&
                    action !== Constant.PLAYER_ACTION_PASS) {
                    nextPlayer = i; // 4
                    break;
                }
                if (i === DeskSeatSpace - 1) {
                    i = -1;
                }
            }
            await this.repository.setHashPoint(playChannelName, playerSit, playerAction, getRoundAction.dBigCost);
        } else {
            // 執行下一位
            let nowPlayer = _.toNumber(getRoundAction.nowPlayer);   // 8
            // tslint:disable-next-line:prefer-conditional-expression
            // if (nowPlayer + 1 >= DeskSeatSpace) {    // 8 + 1
            //     nowPlayer = 0;
            // } else {
            //     nowPlayer =  nowPlayer + 1;
            // }
            nowPlayer = Utils.exceededLength(nowPlayer, DeskSeatSpace);
            for (let i = nowPlayer; i < DeskSeatSpace; i++) { // 0
                const action = _.toNumber(playerAction[i]); // [100,100,100,0,100,100,100,100,30]
                if (action === Constant.NEED_TO_ACTION) {
                    nextPlayer = i;
                    if (nextPlayer !== -1) {
                        break;
                    }
                }
                if (i === DeskSeatSpace - 1) {
                    i = -1;
                }
            }
        }
        const nextPlayerID = await this.repository.setNextPlayer(playChannelName, nextPlayer);
        const nextPlayerInfo = await this.repository.getNextPlayerInfo(nextPlayerID);
        // ----Mei-----------
        const deskInfo = await this.repository.getDeskInfo(playChannelName, nextPlayerID);
        const playerInfo = await this.repository.getPlayerInfo(deskInfo.playerSit, deskInfo.playerBetHash);
        let pushData: any = {};
        const round = _.toNumber(deskInfo.round);
        pushData = {
            playerInfo,
            host: deskInfo.host,
            deskMoney: deskInfo.deskMoney,
            round: deskInfo.round,
            raiseMoney: deskInfo.raiseMoney,
            costRoundMoney: deskInfo.costRoundMoney,
            frontMoney: deskInfo.frontMoney,
            nowPlayer: deskInfo.nowPlayer,
            paPool: deskInfo.paPool,
            publicPoker: [],
            protocol: GameSend.PROTOCOL_ROUND_INFO
        };
        switch (round) {
            case 1:
                break;
            case 2:
                pushData.publicPoker = _.take(deskInfo.publicPoker, 3);
                break;
            case 3:
                pushData.publicPoker = _.take(deskInfo.publicPoker, 4);
                break;
            case 4:
                pushData.publicPoker = _.take(deskInfo.publicPoker, 5);
                break;
        }
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, pushData);
        // this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerInfo[i].playerID, pushData);
        // 玩家按鈕
        /**
         * 看牌
         */
        let checkButton = Constant.BUTTON_OPEN;
        /**
         * 加注
         */
        let raiseButton = Constant.BUTTON_OPEN;
        /**
         * 跟注
         */
        let callButton = Constant.BUTTON_OPEN;
        /**
         * 下注
         */
        let betButton = Constant.BUTTON_CLOSE;
        /**
         * allin
         */
        let allinButton = Constant.BUTTON_OPEN;
        // 跟注金額不為0時 [call, allin, raise, fold]
        // 跟注金額為0時 [Bet,allin,fold,check]
        // 錢少於最低跟注金額 [allin, fold]
        // 玩家錢太多 只能跟注 不知怎花 [call, fold]
        if (_.toNumber(deskInfo.frontMoney) !== 0) { // 跟注金額不為0
            if (nextPlayer === _.toNumber(deskInfo.dBig) &&
                round === 1 &&
                new BigNumber(deskInfo.nextPlayerFrontBet[0]).isEqualTo(deskInfo.frontMoney)) {
                    checkButton = Constant.BUTTON_OPEN;
                    callButton = Constant.BUTTON_CLOSE;
            } else {
                checkButton = Constant.BUTTON_CLOSE;
                callButton = Constant.BUTTON_OPEN;
            }
            if (new BigNumber(deskInfo.nextPlayerFrontBet[0]).isEqualTo(deskInfo.frontMoney)) {
                checkButton = Constant.BUTTON_OPEN;
                callButton = Constant.BUTTON_CLOSE;
            }
        } else {    // 跟注金額為0 [frontMoney]
            betButton = Constant.BUTTON_OPEN;
            callButton = Constant.BUTTON_CLOSE;
            raiseButton = Constant.BUTTON_CLOSE;
            if (new BigNumber(nextPlayerInfo.handsAmount).lte(deskInfo.raiseMoney) ||    // 手上錢 小於最低下注金額
                new BigNumber(nextPlayerInfo.handsAmount).isEqualTo(deskInfo.raiseMoney)) {  // 手上錢 等於最低下注金額
                betButton = Constant.BUTTON_CLOSE;
            }
        }
        if (new BigNumber(nextPlayerInfo.handsAmount).lte(deskInfo.frontMoney)) { // 手上錢 少於最低跟注金額
            raiseButton = Constant.BUTTON_CLOSE;
            callButton = Constant.BUTTON_CLOSE;
            // checkButton = Constant.BUTTON_CLOSE;
        }
        if (processDeskAction[0] === DeskSeatSpace - 1 &&  processDeskAction[2] === 1) { // 有人allin剩我一位時
            if (new BigNumber(nextPlayerInfo.handsAmount).lte(deskInfo.frontMoney)) { // 手上錢 少於最低跟注金額
                raiseButton = Constant.BUTTON_CLOSE;
                callButton = Constant.BUTTON_CLOSE;
            } else {
                allinButton = Constant.BUTTON_CLOSE;
                raiseButton = Constant.BUTTON_CLOSE;
            }
        }
        await this.repository.setPlayerButton(
            nextPlayerID,
            allinButton,
            checkButton,
            raiseButton,
            callButton,
            betButton);
        GHeartbeats.createEvent(1, 1.1, async (count: number, last: boolean) => {
            if (last) {
                const redata = {
                    protocol: 12,
                    button : {
                        ALLIN: allinButton,
                        CHECK: checkButton,    // 之後要改成 checkButton
                        FOLD: Constant.BUTTON_OPEN,
                        RAISE: raiseButton,
                        CALL: callButton,
                        BET: betButton
                    }
                };
                await this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + nextPlayerID, redata);
                await this.repository.countDownerControl(playChannelName);
                const dataGame = {
                    gameStart: 1
                };
                await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, dataGame);
            }
        });
    }
}
