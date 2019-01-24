import { ErrorStatusCode } from '../config/enum.http';

export default class Success {
    public status: ErrorStatusCode;
    public message: any;

    constructor(status: ErrorStatusCode, msg?: string | Success) {
        if (msg instanceof Success) {
            return msg;
        }
        this.status = status;
        this.message = msg ? { message: msg } : { message: ErrorStatusCode[status] };
    }
}
