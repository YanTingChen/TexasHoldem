import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameConnectServer')
export default class GameConnectServer extends BaseService {
    constructor(@inject('GameConnectRepository') private repository: Repository) { super(); }

    public async connect(
        playerId: string
    ): Promise<any> {
        const getPlayerInfo = await this.repository.getPlayerInfo(playerId);
        if (getPlayerInfo.table === Constant.PLAYER_NO_TABLE &&
            getPlayerInfo.table === Constant.PLAYER_NO_SESSION) {
                const data =  {
                    data: {
                        message: 'null'
                    }
                };
                this.socketPushManager.publishChannel(Constant.PRIVATE_CHANNEL + playerId, data);
                return;
        }
        // 從redis 撈出這個玩家當前的按鈕 發送給client
        const getPlayerButton = await this.repository.getPlayerButton(playerId);
        let button: any ;
        if (getPlayerButton.length !== 0) {
            button = {
                ALLIN: _.toNumber(getPlayerButton[0]),
                CHECK: _.toNumber(getPlayerButton[1]),
                FOLD: Constant.BUTTON_OPEN,
                RAISE: _.toNumber(getPlayerButton[2]),
                CALL: _.toNumber(getPlayerButton[3]),
                BET: _.toNumber(getPlayerButton[4])
            };
        } else {
            button = {
                ALLIN: Constant.BUTTON_CLOSE,
                CHECK: Constant.BUTTON_CLOSE,
                FOLD: Constant.BUTTON_CLOSE,
                RAISE: Constant.BUTTON_CLOSE,
                CALL: Constant.BUTTON_CLOSE,
                BET: Constant.BUTTON_CLOSE
            };
        }
        const playChannelName = getPlayerInfo.table;
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName, playerId, button);
        await this.socketPushManager.publishChannel(
            Constant.PRIVATE_CHANNEL + playerId, getDeskInfo);
        return;
    }
}
