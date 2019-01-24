import { IHTTPSCA } from '../microServices/APIManager';
import { EnumTracerconfigSetting } from './EnumTracerconfig';

// Web Environment
const isProdEnv: boolean = process.env.NODE_ENV === 'production';

const domainName: string = ''; // '/APServer'
const corsWhitelist: string[] = [];
const unlessPath = [
    // /^\/mock/,
    // /^\/register/,
    // /^\/forget/,
    // /^\/login\/normal/,
    // /^\/login\/visitor/,
    // /^\/mail/
];

interface IJwtconfig {
    active: boolean;
    privateKey: string;
    expired: any;
}
const jwt: IJwtconfig = {
    active: true,
    privateKey: '9t817h625a433i241wq5wue6r',
    expired: '200y' // Eg: 60, "2 days", "10h", "7d", "200y"
};
// 如果要增加ca證書就從這裡增加
const ca: IHTTPSCA = undefined as any;
interface ITracerconfig {
    filters: EnumTracerconfigSetting;
    open: boolean;
}
// tslint:disable-next-line:variable-name
const Tracerconfig: ITracerconfig = {
    filters: EnumTracerconfigSetting.NoFilter,
    open: false
};
// listen port
const httpPort: number = 3100;
const socketpPort: number = 4100;

export default {
    domainName,
    httpPort,
    jwt,
    Tracerconfig,
    corsWhitelist,
    unlessPath,
    ca
};
