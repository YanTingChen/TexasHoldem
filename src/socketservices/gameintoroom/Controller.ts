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

@provide('GameIntoRoomController')
export default class GameIntoRoomController extends BaseController {
    constructor(@inject('GameIntoRoomServer') private service: Service) {
        super();
    }
    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string,
                playChannelName: string
                session: string
            },
            protocol: number
        }
    ): Promise<any> {
        const playerID = data.data.playerID;
        const playChannelName = data.data.playChannelName;
        const session = data.data.session;
        switch (data.protocol) {
            case GameListen.PROTOCOL_CHOOSE_TABLE:
                const pushData = await this.service.intoRoom(playerID, playChannelName, session)
                .catch((error) => {
                    ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, error);
                    throw error;
                });
                break;
        }
    }
}
