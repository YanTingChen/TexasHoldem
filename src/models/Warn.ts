import { ErrorStatusCode } from '../config/enum.http';
import BaseExceptions from './BaseExceptions';

export default class Warn {
    public status: ErrorStatusCode;
    public message: any;

    constructor(status: ErrorStatusCode, msg?: BaseExceptions | string | Warn) {
        if (msg instanceof BaseExceptions) {
            throw msg;
        }
        if (msg instanceof Warn) {
            return msg;
        }
        this.status = status;
        this.message = msg ? { message: msg } : { message: ErrorStatusCode[status] };
    }
}
