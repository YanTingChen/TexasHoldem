import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import moment = require('moment');
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameSend } from '../../config/GameSend';
import { PokerList } from '../../config/PokerList';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GHeartbeats from '../../models/GHeartbeats';
import Utils from '../../utils/Utils';
import GameButtonCheckServer from '../gamebuttoncheck/Service';
import GameButtonFoldServer from '../gamebuttonfold/Service';
import Repository from './Repository';

@provide('GameStartServer')
export default class GameStartServer extends BaseService {
    constructor(@inject('GameStartRepository') private repository: Repository,
    @inject('GameButtonFoldServer') private gameButtonFold: GameButtonFoldServer,
    @inject('GameButtonCheckServer') private gameButtonCheck: GameButtonCheckServer) { super(); }

    public async gameStart(
        playerID: string,
        playChannelName: string,
        session: string
    ): Promise<any> {
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        // feature:
        // if (_.toNumber(session) !== _.toNumber(getDeskRedisSession)) {
        //     throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        // }
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
        //     throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        // }
        const time = await this.repository.getDBCurrentTime() ;
        // 遊戲是否已經準備開始或是正要開始
        const deskDec = await this.repository.getDeskDec(playChannelName);
        // 檢查玩家人數
        // if (deskDec.deskPeople < deskDec.startPeople && deskDec.deskStatus === 0) {
        //     await this.repository.setPeopleNotFull(playChannelName);
        //     return;
        // }
        if (deskDec.deskPeople < 2 && deskDec.deskStatus === 0) {
            const error = {
                code: 100001
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            await this.repository.setPeopleNotFull(playChannelName);
            return;
        }
        // 判斷是否是桌主開始的模式
        if (deskDec.masterCountDowner !== Constant.IS_MASTER_COUNTDOWN) {
            const error = {
                code: 100002
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            return;
        }
        // 判斷遊戲是否已經開始
        if (deskDec.deskStatus === 1) {
            // 遊戲已經開始
            const playerInfo = await this.repository.getPlayerPointList(playChannelName);   // 取得該桌所有玩家Point
            const playerInfoList: any = [];
            for (const i in playerInfo.player) {
                if (playerInfo.player[i] !== '-1') {
                    playerInfoList.push({
                        player: playerInfo.player[i],
                        point: playerInfo.point[i]
                    });
                }
            }
            const deskInfo = await this.repository.getDeskInfo(playChannelName);    // 取得該桌資訊
            switch (_.toNumber(deskInfo.round)) {
                case 1:
                    deskInfo.publicPoker = _.take(deskInfo.publicPoker, 0);
                    break;
                case 2:
                    deskInfo.publicPoker = _.take(deskInfo.publicPoker, 3);
                    break;
                case 3:
                    deskInfo.publicPoker = _.take(deskInfo.publicPoker, 4);
                    break;
                case 4:
                    deskInfo.publicPoker = _.take(deskInfo.publicPoker, 5);
                    break;
            }
            // const pushData = {
            //     playerInfoList,
            //     deskInfo
            // };
            // this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerID, pushData);
        }
        await this.repository.pushCountDowner(playChannelName, playerID);
        const getCountDowner = await this.repository.getCountDowner(playChannelName);
        let data = {};
        if (getCountDowner === _.toString(playerID)) {
        await this.repository.getDeskCountDowdTime(playChannelName);
        if (_.toNumber(deskDec.deskStatus) === Constant.GAME_NO_PLAYING) {
            /**
             * @getDeskInit = {
             *   host: '-1',
             *   smallCost: '100',
             *   bigCost: '200',
             *   deskPeople: 2,
             *   playerSit: [{playerId: '99999', playerPosition: 0},
             *               {playerId: '66666', playerPosition: 1}]
             * }
             */
            const getDeskInit = await this.repository.getDeskInit(playChannelName);
            let getPlayerSitPosition = getDeskInit.playerSit; // [{memberId, position}]
            const onlinePeople = getDeskInit.deskPeople;
            const nowsession = getDeskInit.session;
            const straddle = getDeskInit.straddle;
            const seatSpeace = getDeskInit.seatSpace;
            let playerHost;
            let playerSmall;
            let playerBig;
            let nowPlayer;
            let straddlePlayer;
            /**
             * @post[0] host
             * @post[1] small
             * @post[2] big
             * @post[3] nowPlayer
             * @post[4] straddle
             * @post[5] 不等大盲
             * @post[6] 這局可以玩的玩家人數
             * @post[7] 這局可以玩的玩家ID
             * @list  = getPlayerSitPosition
             */
            let gamePost;
            if (_.toNumber(getDeskInit.host) === -1) { // 全新的一桌
                for (let i = 0; i < getPlayerSitPosition.length; i++) {
                    if (getPlayerSitPosition[i].playerId !== Constant.NO_PLAYER_S) {
                        gamePost = await Utils.findElementByIndex2(getPlayerSitPosition,
                            i, onlinePeople, straddle, seatSpeace);
                        break;
                    }
                }
            } else { // 已經玩過的桌子
                const small = _.toNumber(getDeskInit.small);
                const big = _.toNumber(getDeskInit.big);
                const beforeGamePlayer = getDeskInit.beforeGamePlayer;
                let _Index: any;
                switch (beforeGamePlayer) {
                    case 2:
                    // 當上一局玩家有2人時
                        _Index = big;
                        break;
                    default:
                    // 當上一局玩家有3人以上時
                        _Index = small;
                        break;
                }
                gamePost = await Utils.findElementByIndex2(getPlayerSitPosition,
                    _Index, onlinePeople, straddle, seatSpeace);
            }
            /**
             * 加注金額
             */
            let raiseMoney;
            playerHost = gamePost.post[0];
            playerSmall = gamePost.post[1];
            playerBig = gamePost.post[2];
            nowPlayer = gamePost.post[3]; // 第幾個玩家開始
            const bigPlayer = gamePost.post[5].length + 1;
            raiseMoney = new BigNumber(getDeskInit.bigCost).multipliedBy(2);
            getPlayerSitPosition = gamePost.list;
            if (straddle === 1 && onlinePeople >= 4) {
                straddlePlayer = gamePost.post[4];
                raiseMoney = new BigNumber(getDeskInit.bigCost).multipliedBy(4).toNumber();
            }
            const bigCost = new BigNumber(getDeskInit.bigCost).multipliedBy(bigPlayer).toNumber();
            const deskMoney = new BigNumber(bigCost).plus(getDeskInit.smallCost).toNumber();

            const shuffled = _.sampleSize(_.shuffle(PokerList.KEYS_NUMBER), Constant.MAXSIZE_PORKER);
            // 把牌打亂加上取出 人數*2 + 5 公牌
            const playersPokers = _.sampleSize(shuffled, (gamePost.post[6] * 2) + 5);
            let index = getPlayerSitPosition.length;
            while (index--) {
                if (getPlayerSitPosition[index].action !== Constant.STATUS_WAITBIG &&
                    getPlayerSitPosition[index].playerId !== Constant.NO_PLAYER_S &&
                    getPlayerSitPosition[index].action !== Constant.NO_ACTION) {
                    const pokers = _.sampleSize(playersPokers, 2);
                    getPlayerSitPosition[index].pokers = [pokers[0], pokers[1]];
                    _.pull(playersPokers, ...pokers);
                }
            }
            const publicPokers = playersPokers;
            await this.repository.setLookPlayerCode(playChannelName, gamePost.post[7]);
            await this.repository.initNewGame(
                playChannelName, playerHost, playerBig, playerSmall, deskMoney,
                getDeskInit.bigCost, nowPlayer, publicPokers, raiseMoney, onlinePeople);
            // 設定玩家手牌
            await this.repository.setPlayerPoker(getPlayerSitPosition,
                            playChannelName, getDeskInit.countDown, nowsession);
            // 歷程記錄
            // await this.repository.playerInfo(playChannelName, getPlayerSitPosition, deskMoney);
            // 減去大小忙注的錢
            gamePost.post[5].push(gamePost.post[2]);
            const subPlayerBet = await this.repository.subPlayerBet(
                gamePost.post[5], getDeskInit.bigCost,
                playerSmall.playerId, getDeskInit.smallCost,
                gamePost.post[4]);
            // 更新playerPoint
            const playerPoint = await this.repository.setPlayerBet(
                playChannelName,
                playerSmall.playerPosition, subPlayerBet.smallBetPoit, getDeskInit.smallCost, playerSmall.playerId,
                subPlayerBet.bigList, subPlayerBet.bigBetPointList);
            // data
            const deskInfo = await this.repository.getDeskInfo2(playChannelName);
            const bigSeatList = subPlayerBet.bigSeatList;
            // 確認錢是否沒有 如果沒有就改action成allin
            const changeAction: any = [];
            for (let i = 0; i < deskInfo.playerPoint.length; i ++) {
                if (_.toNumber(deskInfo.playerPoint[i]) === 0) {
                    changeAction.push(i);
                }
            }
            let bigButton = Constant.BUTTON_OPEN;
            // tslint:disable-next-line:only-arrow-functions
            const findYouButton = _.findIndex(bigSeatList, function(o) {
                return _.toNumber(o) === _.toNumber(deskInfo.nowPlayer); });
            if (findYouButton !== -1) {
                bigButton = Constant.BUTTON_CLOSE;
            }
            await this.repository.changeNoMoneyAction(playChannelName, changeAction);
            GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, 2 ,
                async (_count: number, _last: boolean) => {
                    if (_last) {
                        data = {};
                        data = {
                            host: deskInfo.host,
                            round: deskInfo.round,
                            frontMoney: deskInfo.frontMoney,
                            nowPlayer: deskInfo.nowPlayer,
                            paPool: deskInfo.paPool,
                            publicPoker: [],
                            playerSmall: deskInfo.dSmall,
                            playerSmallCost: getDeskInit.smallCost,
                            playerBig: subPlayerBet.bigSeatList,
                            playerBigCost: getDeskInit.bigCost,
                            playerAction: deskInfo.playerAction,
                            playerPoint: deskInfo.playerPoint,
                            deskMoney,
                            raiseMoney
                        };
                        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
                    }
                });

            data = {};
            GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, onlinePeople + 2 ,
                async (_count: number, _last: boolean) => {
                    if (_last) {
                        data = {
                            protocol: GameSend.PROTOCOL_PLAYER_BUTTON,
                            button: {
                                ALLIN: Constant.BUTTON_OPEN,
                                CHECK: Constant.BUTTON_CLOSE,
                                FOLD: Constant.BUTTON_OPEN,
                                RAISE: Constant.BUTTON_OPEN,
                                CALL: bigButton
                            }
                        };
                        await this.repository.delCountDowner(playChannelName);
                        await this.repository.setPlayerButton(
                            deskInfo.nowPlayerID,
                            Constant.BUTTON_OPEN,
                            Constant.BUTTON_CLOSE,
                            Constant.BUTTON_OPEN,
                            Constant.BUTTON_OPEN,
                            Constant.BUTTON_CLOSE);
                        const dataGame = {
                            gameStart: 1
                        };
                        await this.socketPushManager.publishChannel(
                            Constant.PRIVATE_CHANNEL + deskInfo.nowPlayerID, data);
                        await this.socketPushManager.publishChannel(
                            Constant.ALLCHANNEL + playChannelName, dataGame);
                    }
                });
            this.repository.setPreTime(time, playChannelName);
        } else if (_.toNumber(deskDec.deskStatus) === Constant.GAME_IS_PLAYING) {
            const getNowDesk = await this.repository.getNowDesk(playChannelName);
            const loop = GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, 0,
                async (_count: number, _last: boolean) => {
                    const countDowner = await this.repository.getPlayerTime(getNowDesk.playerID, playChannelName);
                    const getPlayerTime = _.toNumber(countDowner.countDown) + 1;
                    data = {};
                    data = {
                        nowPlayer: getNowDesk.nowPlayer,
                        protocol: GameSend.PROTOCOL_DESK_INFO,
                        count: getPlayerTime -  _count,
                        denominator: getPlayerTime - 1
                    };
                    if (getPlayerTime -  _count > 0) { // 如果大於0 傳到數
                        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
                    }
                    // 控制倒數觸發 有人做動作 停止到數
                    if (countDowner.countDownerControl === 0) {
                        loop.kill();
                        // await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
                        return;
                    } else if (_.toNumber(getPlayerTime) <= _count) {
                        // 棄排or過牌 GO
                        loop.kill();
                        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, data);
                        const getPlayerPoint =
                            await this.repository.getPlayerPoint(getNowDesk.playerID, playChannelName);
                        if (deskDec.frontMoney === _.toNumber(getPlayerPoint)) { // 過牌
                            await
                            this.gameButtonCheck.
                            dealCheckAction(getNowDesk.playerID, playChannelName, _count, true);
                        } else {    // 棄牌
                            await
                            this.gameButtonFold.dealFoldAction(getNowDesk.playerID, playChannelName, _count, true);
                        }
                        return;
                    }
                });
        }
    }
        return;
    }
}
