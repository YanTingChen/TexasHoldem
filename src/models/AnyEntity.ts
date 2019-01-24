import * as _ from 'lodash';
import { ErrorStatusCode } from '../config/enum.http';
import { LibsExceptions } from './LibsExceptions';
export default class AnyEntity {
    public toObj(keys: string | string[], values: any | any[]) {
        if (Array.isArray(keys)) {
            if (keys.length !== values.length) {
                throw new LibsExceptions(ErrorStatusCode.STATUS_FAIL, 'keys 跟 values 長度不一致');
            }
            keys.forEach((key, i, arr) => {
                this[key] = values[i];
            });
        } else {
            this[keys] = values;
        }
        return _.omit(_.omitBy(this, _.isUndefined), 'toObj') as any;
    }
}
