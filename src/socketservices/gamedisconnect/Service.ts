import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import GameRoundServer from '../gameproceround/Service';
import GameSharePaServer from '../gamesharepa/Service';
import Repository from './Repository';

@provide('GameDisconnectServer')
export default class GameDisconnectServer extends BaseService {
    constructor(@inject('GameDisconnectRepository') private repository: Repository,
    @inject('GameSharePaServer') private gamesharepa: GameSharePaServer) { super(); }

    public async disconnectPush(
        playerID: any
    ): Promise<any> {
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        if (getPlayerInfo.action === Constant.STATUS_LEAVE_DESK) {
            return;
        }
        const amount = getPlayerInfo.amount;
        const table = getPlayerInfo.table;
        const seat = getPlayerInfo.seat;
        const handsAmount = getPlayerInfo.handsAmount;
        const newAmount = new BigNumber(amount).plus(handsAmount).toNumber();
        const getLookGamer = await this.repository.getLookGamer(playerID, table);
        /**
         * [ '25', '26' ]
         */
        const loolPlayerListID = getLookGamer.loolPlayerList.keyName;
        /**
         * [ '4', '2' ]
         */
        const loolPlayerListAction = getLookGamer.loolPlayerList.valueName;
        const seatSpace = getLookGamer.seatSpace;
        let disconnectPlayer = 0;
        const numOfplayer = loolPlayerListAction.length;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < numOfplayer; i++) {
            if (_.toNumber(loolPlayerListAction[i]) === Constant.DISCONNECT_PLAYER) {
                disconnectPlayer++;
            }
        }
        // find everyone disconnected?
        if (disconnectPlayer === numOfplayer && getLookGamer.deskStatus === Constant.GAME_IS_PLAYING) {
            let playerAction = getLookGamer.playerAction;
            const thirtyIndex = _.indexOf(playerAction, Constant.WATTING_ACTION_S);
            // one or more player action is thirty
            if (thirtyIndex !== Constant.NO_PLAYER) {
                // tslint:disable-next-line:only-arrow-functions
                const newPlayerAction = _.map(playerAction, function(value) {
                    const val = _.toNumber(value);
                    if (val < Constant.WATTING_ACTION) {
                        return Constant.PLAYER_ACTION_FOLD;
                    }
                    return val;
                });
                playerAction =  await this.repository.updateNewAction(table, newPlayerAction);
            }
            // no player action is thirty
            if (thirtyIndex === Constant.NO_PLAYER) {
                // tslint:disable-next-line:only-arrow-functions
                const newPlayerAction = _.map(playerAction, function(value) {
                    const val = _.toNumber(value);
                    if (val < Constant.WATTING_ACTION) {
                        return Constant.WATTING_ACTION;
                    }
                    return val;
                });
                playerAction = await this.repository.updateNewAction(table, newPlayerAction);
            }
            const processDeskAction: any = Utils.playerActionTotal(playerAction);
            if ((processDeskAction[0] === seatSpace) ||
                (processDeskAction[0] === seatSpace - 1 &&  processDeskAction[1] === 1) ||
                (processDeskAction[4] === seatSpace - 1 &&  processDeskAction[2] === 1)
                ) {
                await this.repository.setCountDownerControl(table);
                // 分錢 第一個狀況所有人allin or 棄牌 含沒有動作的玩家
                // No.2 剩一個人跟注 其他人allin或棄牌 含沒有動作的玩家
                await this.gamesharepa.dealPot(table);
                await this.gamesharepa.dealSharePa(table);
                return;
            }
            if (processDeskAction[3] === seatSpace) {
                await this.repository.setCountDownerControl(table);
                await this.gamesharepa.dealPot(table);
                await this.gamesharepa.dealSharePa(table);
                return;
            }
        }
        // last player disconnect table need to Init
        if (disconnectPlayer === numOfplayer &&
            getLookGamer.deskStatus === Constant.GAME_NO_PLAYING &&
            table !== -1) {
            await this.repository.tableNeedInit(table, seatSpace);
        }
    }

}
