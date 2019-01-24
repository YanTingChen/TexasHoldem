import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';

@provide('PublishController')
export default class PublishController {
    public async on(channel: string, data: any): Promise<any> {
        //
    }
    public async join(data: any): Promise<any> {
        //
    }
    public async leave(data: any): Promise<any> {
        //
    }
}
