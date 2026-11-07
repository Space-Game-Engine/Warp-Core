import {Module} from '@nestjs/common';

import {AddInstallService} from '@warp-core/core/install';
import {DatabaseModule} from '@warp-core/database/database.module';
import {ResearchNodeQuerySubscriber} from '@warp-core/global/research-node/exchange/subscriber/research-node-query.subscriber';
import {ResearchNodeInstallService} from '@warp-core/global/research-node/install/research-node-install.service';
import {ResearchNodeResolver} from '@warp-core/global/research-node/research-node.resolver';
import {ResearchNodeService} from '@warp-core/global/research-node/research-node.service';

@Module({
	providers: [
		ResearchNodeService,
		ResearchNodeResolver,
		ResearchNodeInstallService,
		ResearchNodeQuerySubscriber,
	],
	imports: [DatabaseModule],
	exports: [ResearchNodeService, ResearchNodeInstallService],
})
@AddInstallService(ResearchNodeInstallService)
export class ResearchNodeModule {}
