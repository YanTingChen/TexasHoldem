import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Repository from './Repository';

@provide('GameAddPointServer')
export default class GameAddPointServer extends BaseService {
    constructor(@inject('GameAddPointRepository') private repository: Repository) { super(); }

    public async needBuy(playerId: string): Promise<any> {
        const getPlayInfo = await this.repository.getPlayInfo(playerId);
        const amount = getPlayInfo.amount;
        const table = getPlayInfo.table;
        const seat = getPlayInfo.seat;
        let handsAmount = 0;
        if (_.toNumber(getPlayInfo.handsAmount) !== -1) {
            handsAmount = _.toNumber(getPlayInfo.handsAmount);
        }
        const getDeskMin = await this.repository.getDeskMin(table);
        const newAmount = new BigNumber(amount).minus(getDeskMin).toNumber();
        const newhandsAmount = new BigNumber(handsAmount).plus(getDeskMin).toNumber();
        await this.repository.updatePlayInfoNeedBuy(playerId, table, seat, newAmount, newhandsAmount);
        const getNewSit = await this.repository.getNewSit(table);
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + table, getNewSit);
    }

    public async noBuy(playerId: string): Promise<any> {
        const getPlayInfo = await this.repository.getPlayInfo(playerId);
        const amount = getPlayInfo.amount;
        const table = getPlayInfo.table;
        const seat = getPlayInfo.seat;
        const handsAmount = getPlayInfo.handsAmount;
        const newAmount = new BigNumber(amount).plus(handsAmount).toNumber();
        await this.repository.updatePlayInfoNoBuy(playerId, table, seat, newAmount);
        const getNewSit = await this.repository.getNewSit(table);
        await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + table, getNewSit);
    }

}
