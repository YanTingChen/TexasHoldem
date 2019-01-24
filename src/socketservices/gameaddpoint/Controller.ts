import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import WsEntity from '../../models/WsEntity';
import Service from './Service';

@provide('GameAddPointController')
export default class GameAddPointController extends BaseController {
    constructor(@inject('GameAddPointServer') private service: Service) {
        super();
    }
    public async on(
        ws: WsEntity,
        data: {
            playerID: string,
            changeBuy: number
        }
    ): Promise<any> {
        const playerId = data.playerID;
        const changeBuy = data.changeBuy;
        switch (changeBuy) {
            case 1: // 買入
                await this.service.needBuy(playerId);
                break;
            case 0: // 不買入
                await this.service.noBuy(playerId);
                break;
        }
        return;
    }
}
