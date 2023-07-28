import {HabitatModel as DbHabitatModel} from '@warp-core/database';
import {InjectableProxy} from 'nestjs-cls';

@InjectableProxy()
export class AuthorizedHabitatModel extends DbHabitatModel {}
