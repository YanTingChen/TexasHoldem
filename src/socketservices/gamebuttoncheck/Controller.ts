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

@provide('GameButtonCheckController')
export default class GameButtonCheckController extends BaseController {
    constructor(@inject('GameButtonCheckServer') private service: Service) {
        super();
    }
    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string,
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
                const pushData =
                        await this.service.dealCheckAction(
                            playerID,
                            playChannelName,
                            costTime)
                            .catch((err) => {
                            ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                            throw err;
                        });
                break;
        }
    }
}
