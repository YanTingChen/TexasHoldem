import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import * as _ from 'lodash';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import IContext from '../../models/IContext';

@provideNamed(TYPE.Controller, 'MockController')
@controller('/mock')
export default class MockController extends BaseController {
    constructor() { super(); }

    // 寄出驗證信
    @httpPost('/mail')
    public async mail(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
              msssage: 'success'
            }
        };
    }

    // 註冊
    @httpPost('/register')
    public async register(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                account: 'tom_chen@arcadiatw.com',
                key: '{member:barrel}:hash:1',
                token: '7c4a8d09ca3762af61e59520943dc26494f8941b'
            }
        };
    }

    // 忘記密碼
    @httpPost('/forget')
    public async forget(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                msssage: 'success'
            }
        };
    }

    // 正常登入
    @httpPost('/normal')
    public async normal(ctx: IContext) {
        const _int = _.toInteger(Math.random() * 99999);
        ctx.body = {
            status: 1,
            result: {
                account: 'tom_chen@arcadiatw.com',
                key: '{member:barrel}:hash:1',
                token: '7c4a8d09ca3762af61e59520943dc26494f8941b',
                id: _int,
                realname: 'test ' + _int,
                nickname: 'test' + _int
            }
        };
    }

    // 快速登入
    @httpPost('/quick')
    public async quick(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                msssage: 'success'
            }
          };
    }

    // 遊客登入
    @httpPost('/visitor')
    public async visitor(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
              id: 1,
              realname: 'Thomas Cruise Mapother IV',
              nickname: 'Tom Cruise',
              diamond: 500,
              chip: 20000
            }
        };
    }

    // 登出
    @httpPost('/signOut')
    public async signOut(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
              msssage: 'success'
            }
        };
    }

    // 取得玩家資料
    @httpPost('/getmember')
    public async getmember(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                id: 1,
                nickname: 'Tom Cruise'
            }
        };
    }

    // 修改密碼
    @httpPost('/modifypassword')
    public async modifypassword(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                message: 'success'
            }
        };
    }

    // 修改信箱
    @httpPost('/modifyemail')
    public async modifyemail(ctx: IContext) {
        ctx.body = ctx.body = {
            status: 1,
            result: {
                message: 'success'
            }
        };
    }

    // 修改暱稱
    @httpPost('/modifynickname')
    public async modifynickname(ctx: IContext) {
        ctx.body = ctx.body = {
            status: 1,
            result: {
                message: 'success'
            }
        };
    }

    // 發放籌碼
    @httpPost('/give')
    public async give(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                managerId: 'managerId',
                playerId: 'playerId',
                chips: 6666
            }
        };
    }
    // 收回籌碼
    @httpPost('/takeback')
    public async takeback(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                managerId: 'managerId',
                playerId: 'playerId',
                chips: 7777
            }
        };
    }
    // 結算籌碼
    @httpPost('/settlement')
    public async settlement(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: 1
        };
    }
    // 儲值鑽石
    @httpPost('/deposit')
    public async deposit(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                playerId: 'playerIdddddddddd',
                diamonds: 1111111
            }
        };
    }
    // 花費鑽石
    @httpPost('/cost')
    public async cost(ctx: IContext) {
        ctx.body = {
            status: 1,
            result: {
                playerId: 'playerIdddddddddd',
                diamonds: 2222222
            }
        };
    }
}
