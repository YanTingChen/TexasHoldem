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

@provide('GameButtonMenuController')
export default class GameButtonMenuController extends BaseController {
    constructor(@inject('GameButtonMenuServer') private service: Service) { super(); }

    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string,
                playChannelName: string,
                session: string,
                costTime,
                AddPoint
            },
            protocol: number
        }
    ): Promise<any> {

        const playerID = data.data.playerID;
        const playChannelName = data.data.playChannelName;
        const session = data.data.session;
        const costTime = data.data.costTime;
        switch (data.protocol) {
            case GameListen.PROTOCOL_BUTTON_LEAVESEAT:
                await this.service.leaveSeat(playerID, playChannelName)
                    .catch((err) => {
                        ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                        throw err;
                    });
                break;
            case GameListen.PROTOCOL_BUTTON_LEAVEDESK:
                await this.service.leaveDesk(playerID, playChannelName, costTime)
                .catch((err) => {
                    ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                    throw err;
                });
                break;
            case GameListen.PROTOCOL_BUTTON_CANCELWAITBIG:
                await this.service.cancelWaitBig(playerID, playChannelName, session, costTime)
                .catch((err) => {
                    ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                    throw err;
                });
                break;
        }
    }
}
