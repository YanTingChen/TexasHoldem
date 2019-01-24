import * as _ from 'lodash';
import moment = require('moment');
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameConnectServer from '../gameconnect/Service';
import Repository from './Repository';

@provide('GameIntoRoomServer')
export default class GameIntoRoomServer extends BaseService {
    constructor(@inject('GameIntoRoomRepository') private repository: Repository,
    @inject('GameConnectServer') private connectServer: GameConnectServer) { super(); }

    public async intoRoom(
        playerID: string,
        playChannelName: string,
        session: string): Promise<any> {
        const deskList = await this.repository.getDeskList();
        // 檢查 牌桌 是否存在
        if (!_.some(deskList, (even) => {
            return even === playChannelName;
        })) {
            const error = {
                code: 100009
            };
            await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + playerID, error);
            throw new Exceptions(9001, 'not found this channel');
        }
        // const getPlayerRedisSession = await this.repository.getPlayerRedisSession(data.playerID);
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(Constant.WHAT_THE_HACK)) {
        //     throw new Exceptions(9001, 'member: ' + data.playerID + ' already in other table');
        // }
        const getDeskSession = await this.repository.getDeskSession(playChannelName);
        if (getDeskSession === 0) {
            throw new Exceptions(9001, 'desk session: ' + getDeskSession + ' error');
        }
        const playerAction = await this.repository.getplayerAction(playerID);
        if (_.toNumber(playerAction) === Constant.DISCONNECT_PLAYER) {
            await this.connectServer.connect(playerID);
            return;
        }
        // 檢查時間是否超時
        const time = await this.repository.getDBCurrentTime() ;
        const deskPre = await this.repository.deskPreTime(playChannelName, time);
        const deskPreTime = new Date(deskPre.preTime);
        const tableNeedInit = moment(time).diff(deskPreTime.toISOString(), 'm');
        // 如果 閒置時間大於兩分鐘 牌桌狀態呈現開始 此桌 便是無效
        if (tableNeedInit > 2 && deskPre.deskStatus === 1) {
            // 去資料庫撈新的session 和 初始化table
            await this.repository.tableNeedInit(playChannelName, _.toNumber(deskPre.seatSpace));
        }
        const deskInfo = await this.repository.getDeskInfo(playChannelName, playerID, time);
        await this.repository.initPlayer(
            playerID,
            playChannelName,
            getDeskSession,
            deskInfo.playerCountDown
        );
        this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerID, deskInfo);
        return;
    }
}
