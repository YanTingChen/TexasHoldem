import { controller, httpPost, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Utils from '../../utils/Utils';
import Service from './Service';
@provideNamed(TYPE.Controller, 'LeaveDeskController')
@controller('/leavedesk')
export default class LeaveDeskController extends BaseController {
    constructor(
        @inject('LeaveDeskServer') private service: Service) { super(); }

    // 離桌
    @httpPost('/')
    public async leave(ctx: IContext) {
        const member = ctx.state.user as any;
        const id = Utils.Decryption_AES_ECB_128(member.id); // 會員序號
        const playChannelName = ctx.request.body.reqData.desk;
        ctx.body = new BaseResponse(await this.service.leaveDesk(id, playChannelName, 0));
    }

}
