import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import GameButtonMenuServer from '../../socketservices/gamebuttonmenu/Service';
import Repository from './Repository';

@provide('ConflictServer')
export default class ConflictServer extends BaseService {
    constructor(@inject('ConflictRepository') private repository: Repository,
    @inject('GameButtonMenuServer') private gameButtonMenuServer: GameButtonMenuServer
    ) {
        super();
    }

    public async leaveDesk(id: string, playChannelName: string, costTime: number): Promise<any> {
        await this.socketPushManager.publishChannel(Constant.PRIVATE_ERRORCHANNEL + id, {code: 100011});
        await this.gameButtonMenuServer.leaveDesk(id, playChannelName, costTime);
        return this.repository.leaveDesk();
    }

}
