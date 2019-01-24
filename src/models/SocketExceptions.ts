import * as _ from 'lodash';

export default class SocketExceptions {
    public status: number;
    public code: number;
    public message: any;
    constructor(_code, _message) {
        this.status = 1;
        this.code = _code;
        this.message = _message;
    }
}
