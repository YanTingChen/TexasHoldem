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

@provide('GameDisconnectController')
export default class GameDisconnectController extends BaseController {
    constructor(@inject('GameDisconnectServer') private service: Service) {
        super();
    }
    public async on(
        playerID: any
    ): Promise<any> {
        if (playerID) {
        await this.service.disconnectPush(playerID).catch((err) => {
            throw err;
        });
        }
    }
}
