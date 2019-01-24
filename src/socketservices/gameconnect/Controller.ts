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

@provide('GameConnectController')
export default class GameConnectController extends BaseController {
    constructor(@inject('GameConnectServer') private service: Service) {
        super();
    }
    // "start:prod": "tsc && node dist/app.js"
    public async on(
        ws: WsEntity,
        data: {
            data: {
                playerID: string
            }
        }
    ): Promise<any> {
        const playerId = data.data.playerID;
        return this.service.connect(playerId);
    }
}
