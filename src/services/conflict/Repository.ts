import * as _ from 'lodash';
import 'reflect-metadata';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('ConflictRepository')
export default class ConflictRepository extends BaseRepository {
    constructor() { super(); }

    public async leaveDesk(): Promise<any> {
        return {
            msssage: 'success'
        };
    }

}
