import * as _ from 'lodash';
import { ErrorStatusCode } from '../config/enum.http';

export default abstract class BaseExceptions extends Error {
    public status: ErrorStatusCode;
    public message: any;

    constructor(status: ErrorStatusCode, msg?: string | any) {
        super();
        if (msg instanceof BaseExceptions) {
            throw msg;
        }
        // gama-orm的底層錯誤處理
        if (!_.isUndefined(msg) && msg.name === 'RequestError') {
            msg = msg.message;
        }
        this.status = status;
        this.name = status ? status.toString() : '';
        this.message = msg;
    }
}
