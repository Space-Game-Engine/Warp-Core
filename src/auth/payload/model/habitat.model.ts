import {InjectableProxy} from 'nestjs-cls';

import {HabitatModel as DbHabitatModel} from '@warp-core/database/model/habitat.model';

@InjectableProxy()
export class AuthorizedHabitatModel extends DbHabitatModel {}
