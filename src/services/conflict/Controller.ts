import { controller, httpPost, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Utils from '../../utils/Utils';
import Service from './Service';
@provideNamed(TYPE.Controller, 'ConflictController')
@controller('/conflict')
export default class ConflictController extends BaseController {
    constructor(
        @inject('ConflictServer') private service: Service) { super(); }

    // 衝突登入
    @httpPost('/')
    public async mail(ctx: IContext) {
        const member = ctx.state.user as any;
        const id = Utils.Decryption_AES_ECB_128(member.id);
        const playChannelName = ctx.request.body.reqData.desk;
        ctx.body = new BaseResponse(await this.service.leaveDesk(id, playChannelName, 0));
    }

}
