import * as _ from 'lodash';
import 'reflect-metadata';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('LeaveDeskRepository')
export default class LeaveDeskRepository extends BaseRepository {
    constructor() { super(); }

    public async leaveDesk(): Promise<any> {
        return {
            msssage: 'success'
        };
    }

}
