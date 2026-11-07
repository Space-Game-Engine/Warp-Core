import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {DatabaseModule} from '@warp-core/database/database.module';
import {TechnologyService} from '@warp-core/user/technology/service/technology.service';
import {TechnologyResolver} from '@warp-core/user/technology/technology.resolver';

@Module({
	providers: [TechnologyService, TechnologyResolver],
	imports: [DatabaseModule, AuthModule],
})
export class TechnologyModule {}
