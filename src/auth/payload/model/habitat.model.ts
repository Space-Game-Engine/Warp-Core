import {InjectableProxy} from 'nestjs-cls';

import {HabitatModel as DbHabitatModel} from '@warp-core/database';

@InjectableProxy()
export class AuthorizedHabitatModel extends DbHabitatModel {}
