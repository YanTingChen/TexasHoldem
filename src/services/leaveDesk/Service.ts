import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import GameButtonMenuServer from '../../socketservices/gamebuttonmenu/Service';
import Repository from './Repository';

@provide('LeaveDeskServer')
export default class LeaveDeskServer extends BaseService {
    constructor(@inject('LeaveDeskRepository') private repository: Repository,
    @inject('GameButtonMenuServer') private gameButtonMenuServer: GameButtonMenuServer
    ) {
        super();
    }

    public async leaveDesk(id: string, playChannelName: string, costTime: number): Promise<any> {
        await this.gameButtonMenuServer.leaveDesk(id, playChannelName, costTime);
        return this.repository.leaveDesk();
    }

}
