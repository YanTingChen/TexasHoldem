import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import * as _ from 'lodash';
import 'reflect-metadata';
import { GameListen } from '../../config/GameListen';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import WsEntity from '../../models/WsEntity';
import Service from './Service';

@provide('GameButtonAllinController')
export default class GameButtonAllinController extends BaseController {
    constructor(@inject('GameButtonAllinServer') private service: Service) {
        super();
    }
    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string,
                playChannelName: string
            },
            protocol: number
        }
    ): Promise<any> {
        switch (data.protocol) {
            case GameListen.PROTOCOL_BUTTON_ACTION:
            const playerID = _.toString(data.data.playerID);
            const playChannelName = data.data.playChannelName;
            await this.service.dealAllinAction(
                playerID,
                playChannelName
                ).catch((err) => {
                ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_DESK_INFORMATION, err);
                throw err;
            });
            break;
        }
    }
}
