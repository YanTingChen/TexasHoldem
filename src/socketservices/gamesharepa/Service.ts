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
import Repository from './Repository';

@provide('GameSharePaServer')
export default class GameSharePaServer extends BaseService {
    constructor(@inject('GameSharePaRepository') private repository: Repository) { super(); }

    public async dealPot(
        playChannelName: string
    ): Promise<any> {
        const getprocessPa = await this.repository.getprocessPa(playChannelName);
        const allinCheck = getprocessPa.allinBet.length;
        const allinBet = getprocessPa.allinBet;
        let deskMoney = getprocessPa.deskMoney;
        const roundBet = getprocessPa.roundBet;
        const paPool = getprocessPa.paPool;
        let paMoney = 0;
        /**
         * pot池大小
         */
        const allPaSize = paPool.length;
        // add all pot money
        if (allPaSize > 0) {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < allPaSize; i++) {
                const _paMoney = new BigNumber(paMoney).plus(paPool[i]);
                paMoney = _.toNumber(_paMoney);
            }
        }
        deskMoney = new BigNumber(deskMoney).minus(paMoney).toNumber();
        // 分錢池流程 先看所有allin金額 找出對低不同的 之後取最低的金額 去剪掉剩下最高的
        // 總錢池減去那些 最高的金額(已被減去最低金額) 成別的pot池
        if (allinCheck > 0) {
            // 有人allin 要分pa
            for (let i = 0 ; i < allinCheck; i++) {
                let otherMoney = 0;
                const procesBet = allinBet.pop();   // 取最小值
                for (let ai = 0; ai < allinBet.length; ai++) {
                    allinBet[ai] = new BigNumber(allinBet[ai]).minus(procesBet).toNumber();
                }
                for (let ak = 0; ak < roundBet.length; ak++) {
                    let _otherMoney;
                    if (_.toNumber(roundBet[ak]) > 0) {
                        roundBet[ak] = new BigNumber(roundBet[ak]).minus(procesBet).toNumber();
                        _otherMoney = new BigNumber(otherMoney).plus(roundBet[ak]).toNumber();
                        if (_.toNumber(roundBet[ak]) === 0) {
                            const palength = (paPool.length + 1) * -1;
                            roundBet[ak] = palength;
                        }
                        otherMoney = _otherMoney;
                    }
                }
                deskMoney = new BigNumber(deskMoney).minus(otherMoney).toNumber();
                if (deskMoney !== 0) {
                    paPool.push(deskMoney);
                    deskMoney = otherMoney;
                }
            }
        }
        // 沒人allin
        await this.repository.setpaPoolInfo(playChannelName, paPool, roundBet, getprocessPa.playerName);
        return;
    }
    public async dealSharePa(
        playChannelName: string
    ): Promise<any> {
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName);
        const playerName = getDeskInfo.playerName;
        const getPlayInfo =
            await this.repository.getPlayInfo(getDeskInfo.playerSit, getDeskInfo.playerAction);
        let playerInfo = getPlayInfo;
        const publicPoker = getDeskInfo.publicPoker;
        const allPokerList: any = [];
        // 將 玩家資訊組合
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playerInfo.length; i++) {
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < playerName.length; j++) {
                // 組合 公牌和私牌
                if (playerInfo[i].id === playerName[j]) {
                    playerInfo[i].poker = _.concat(playerInfo[i].poker, publicPoker);
                    allPokerList.push(playerInfo[i].poker);
                    playerInfo[i].playerStatusPool = getDeskInfo.roundBet[j];
                    playerInfo[i].pk = 1;
                }
            }
        }
        // 算每個人牌的比重
        const weigthInfo = await Utils.getWeigth(allPokerList);
        for (let i = 0, j = 0; i < playerInfo.length; i++) {
            if (playerInfo[i].pk === 1) {
                if (_.toNumber(playerInfo[i].playerStatusPool) === Constant.NO_SHARE_PA) {
                    playerInfo[i].weigth = 0;
                    playerInfo[i].showCard = 0;
                } else {
                    playerInfo[i].weigth = weigthInfo[j].Rank;
                    playerInfo[i].Type5Ch = weigthInfo[j].Type5Ch;
                    playerInfo[i].Type5En = weigthInfo[j].Type5En;
                    playerInfo[i].turnMoney = 0;
                    playerInfo[i].showCard = 1;
                    j++;
                }
            } else {
                playerInfo[i].weigth = 0;
                playerInfo[i].showCard = 0;
            }
        }
        playerInfo = _.orderBy(playerInfo, 'weigth', 'asc');
        // 排名
        for (let i = playerInfo.length - 1, j = 1; i > -1 ; i--) {
            if (i >= 1) {
                if (playerInfo[i].weigth === playerInfo[i - 1].weigth) {
                    playerInfo[i].rank = j;
                } else {
                    playerInfo[i].rank = j;
                    j++;
                }
            } else {
                playerInfo[i].rank = j;
            }
            if (_.toNumber(playerInfo[i].playerStatusPool) === 0) {
                playerInfo[i].playerStatusPool = 1;
            }
        }   // rank end
        const paPoolCount = getDeskInfo.paPool.length;
        const paPool = getDeskInfo.paPool;
        for (let i = 0; i < paPoolCount; i++) {
            const paShare: any = [];
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0, k = 1; j < playerInfo.length; j++) {
                if (_.toNumber(playerInfo[j].playerStatusPool) !== -99) {
                    let playerStatusPool = 0;
                    // tslint:disable-next-line:prefer-conditional-expression
                    if (_.toNumber(playerInfo[j].playerStatusPool) < 0) {
                         playerStatusPool =  playerInfo[j].playerStatusPool * -1;
                    } else  {
                         playerStatusPool =  playerInfo[j].playerStatusPool;
                    }
                    // i => 錢池 j => 玩家 k => 排名
                    if (playerStatusPool > i) { // 第0 個池 要分給playerStatusPool是1的 300
                        if (playerInfo[j].rank === k) { // 找第一名
                            paShare.push(playerInfo[j]);
                        }
                    }
                }
                if (paShare.length === 0 && j === playerInfo.length - 1) {  // 找地2名
                    k++;
                    j = -1;
                }
            }// 看誰是贏家
            const paShareCount = paShare.length;
            const finalMoney: any = new BigNumber(paPool[i]).div(paShareCount).toNumber();
            for (let j = 0 ; j < paShareCount; j++) {
                // tslint:disable-next-line:prefer-for-of
                for (let k = 0; k < playerInfo.length; k++) {
                    if (paShare[j].id === playerInfo[k].id) {
                        playerInfo[k].turnMoney = new BigNumber(finalMoney).plus(playerInfo[k].turnMoney).toNumber();

                    }
                }
            }// 分錢
        }//
        const systemTime: any = await this.repository.getDBCurrentTime();
        const game = getDeskInfo.game;
        const newSession = await this.repository.getSession(game);
        await this.repository.updatePlayerInfo(playChannelName, playerInfo, newSession);
        const winnerInfo: any = [];
        const processDeskAction: any = Utils.playerActionTotal(getDeskInfo.playerAction);
        // const DeskSeatSpace = _.toNumber(getDeskInfo.seatSpace);
        let showCard = 1;
        if (processDeskAction[4] === getDeskInfo.seatSpace - 1) {
            showCard = 0;
        }
        // tslint:disable-next-line:forin
        for (const i in playerInfo) {
            winnerInfo.push({
                playerID: playerInfo[i].id,
                poker: _.take(playerInfo[i].poker, 2),
                turnMoney: playerInfo[i].turnMoney,
                rank: playerInfo[i].rank,
                Type5En: playerInfo[i].Type5En,
                Type5Ch: playerInfo[i].Type5Ch,
                showCard: playerInfo[i].showCard
            });
        }
        let pushData: any = {};
        pushData = {
            protocol: GameSend.PROTOCOL_WINNER_INFO,
            winnerInfo,
            publicPoker,
            showCard
        };
        const clientTime = Constant.GAME_ROUND - getDeskInfo.round;
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, pushData);
        const callNoMoney = await this.repository.getOutTableNoKick(playChannelName, newSession, getDeskInfo.dBigCost);
        // await this.repository.getOutTable(playChannelName, newSession);
        GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, Constant.CLIENT_GAME_END_ANIMATION + clientTime,
            async (_count: number, _last: boolean) => {
            if (_last) {
                const data = {
                    code: 100010,
                    button: []
                };
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < callNoMoney.length; i++) {
                    this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + callNoMoney[i], data);
                }
                const rdata = await this.repository.getDeskInfo2(playChannelName);
                await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, rdata);
                return ;
            }
        });
        this.repository.updateSession(getDeskInfo.session, systemTime, '', '', '', '', '[]', '');
        return;
    }
}
