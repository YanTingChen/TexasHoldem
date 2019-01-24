import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { ErrorStatusCode } from '../../config/enum.http';
import { GameSend } from '../../config/GameSend';
import { PokerList } from '../../config/PokerList';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import Repository from './Repository';

@provide('GameSelectSeatServer')
export default class GameSelectSeatServer extends BaseService {
    constructor(@inject('GameSelectSeatRepository') private repository: Repository) { super(); }

    public async SelectSeat(playerID: string, position) {
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        const playChannelName = getPlayerInfo.channelName;
        if (playChannelName === Constant.WHAT_THE_HACK) {
            const error = {
                code: 100008
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(ErrorStatusCode.WHAT_THE_HACK, Constant.WHAT_THE_HACK);
        }
        const getPlayerRedisSession = getPlayerInfo.sessionRecordID;
        const getDesk = await this.repository.getDesk(playChannelName);
        // const getPlaySit = await this.repository.getPlaySit(playChannelName);
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDesk.session)) {
        //     throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        // }
        // 判斷位置是否有人
        if (_.toNumber(getDesk.playerSit[position]) !== Constant.NO_PLAYER) {
            const error = {
                code: 100007
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(ErrorStatusCode.CANT_SEAT, ErrorStatusCode.CANT_SEAT);
        }
        /**
         * 玩家總金額
         */
        const amount = new BigNumber(_.toString(getPlayerInfo.amount));
        const errorMsg = {
            code: 100006,
            button: ['Confirm', 'Cancel']
        };
        // 判斷玩家籌碼是否有誤
        if (getPlayerInfo.amount === '' ||
            getPlayerInfo.amount === '0' ||
            getPlayerInfo.amount === 'nil') {
            errorMsg.code = ErrorStatusCode.NO_ENOUGH_MONEY;
            errorMsg.button = ['Confirm'];
            return this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, errorMsg);
        }
        /**
         * 玩家攜入金額
         */
        if (amount.lt(getDesk.deskMin)) {
            return this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, errorMsg);
        }
        const remainAmount = amount.minus(getDesk.deskMin).toNumber();
        await this.repository.playTakeSit(
            playChannelName,
            position,
            playerID,
            getDesk.deskMin,
            remainAmount,
            getDesk.playerCountDown,
            getPlayerInfo.nickName);
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName);
        let pushData: any = {};
        pushData = {
            protocol: GameSend.PROTOCOL_SELECT_SEAT,
            host: getDeskInfo.dHost,
            deskMoney: getDeskInfo.deskMoney,
            playerSit: getDeskInfo.playerSit,
            playerName: getDeskInfo.playerName,
            // playerAction: getDeskInfo.playerAction,
            playerPoint: getDeskInfo.playerPoint,
            publicPoker: []
        };
        if (getDesk.deskStatus === Constant.GAME_NO_PLAYING) {
            pushData.gameStart = 1;
        }
        switch (getDeskInfo.round) {
            case 1:
                break;
            case 2:
                pushData.publicPoker = _.take(getDeskInfo.publicPoker, 3);
                break;
            case 3:
                pushData.publicPoker = _.take(getDeskInfo.publicPoker, 4);
                break;
            case 4:
                pushData.publicPoker = _.take(getDeskInfo.publicPoker, 5);
                break;
        }
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, pushData);
        // 若遊戲已開始，玩家坐位選擇在「莊家與小盲[3人]」之間
        // 計算正在遊戲中的玩家數量
        let playingPeople = 0;
        // tslint:disable-next-line:only-arrow-functions
        _.forEach(getDeskInfo.playerAction, function(value, key) {
            if (_.toNumber(value) !== Constant.PLAYER_ACTION_PASS) {
                playingPeople++;
            }
        });
        const small = _.toNumber(getDeskInfo.dsmall);
        const big = _.toNumber(getDeskInfo.dbig);
        const playerSit = getDeskInfo.playerSit;
        const index = Utils.exceededLength(_.toNumber(getDeskInfo.dHost), playerSit.lenght);
        const pushButton = {
            protocol: 13,
            CANCELWAITBIG: Constant.BUTTON_OPEN
        };
        if (_.toNumber(getDeskInfo.deskStatus) === Constant.GAME_IS_PLAYING) {
            // 牌局已開始
            if (playingPeople === 2) {
                // 2人
                for (let i = index; i < playerSit.length; i++) {
                    if (i === big) { break; }
                    if (playerSit[i] === playerID) {
                        await this.repository.setPlayerAction(playerID);
                        return this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerID, pushButton);
                    }
                    if (i === playerSit.length - 1) { i = -1; }
                }
            } else {
                // 3人以上
                for (let i = index; i < playerSit.length; i++) {
                    if (i === small) { break; }
                    if (playerSit[i] === playerID) {
                        await this.repository.setPlayerAction(playerID);
                        return this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerID, pushButton);
                    }
                    if (i === playerSit.length - 1) { i = -1; }
                }
            }
        }
        return;
    }
}
