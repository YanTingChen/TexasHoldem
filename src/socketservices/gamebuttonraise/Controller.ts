import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import 'reflect-metadata';
import { GameListen } from '../../config/GameListen';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import WsEntity from '../../models/WsEntity';
import Service from './Service';

@provide('GameButtonRaiseController')
export default class GameButtonRaiseController extends BaseController {
    constructor(@inject('GameButtonRaiseServer') private service: Service) {
        super();
    }
    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string,
                costBet: number,
                playChannelName: string,
                session: string,
                costTime
            },
            protocol: number
        }
    ): Promise<any> {
        switch (data.protocol) {
            case GameListen.PROTOCOL_BUTTON_ACTION:
                const playerID = data.data.playerID;
                const playChannelName = data.data.playChannelName;
                const costTime = data.data.costTime;
                const costBet = data.data.costBet;
                const pushData =
                        await this.service.dealRaiseAction(
                            playerID, playChannelName, costTime, costBet)
                            .catch((err) => {
                                ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                                throw err;
                            });
                ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, pushData);
                break;
        }
    }
}
