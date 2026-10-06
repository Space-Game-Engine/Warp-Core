import {Module} from '@nestjs/common';

import {DatabaseModule} from '@warp-core/database/database.module';
import {ResearchNodeQuerySubscriber} from '@warp-core/global/research-node/exchange/subscriber/research-node-query.subscriber';
import {ResearchNodeService} from '@warp-core/global/research-node/research-node.service';

@Module({
	providers: [ResearchNodeService, ResearchNodeQuerySubscriber],
	imports: [DatabaseModule],
	exports: [ResearchNodeService],
})
export class ResearchNodeModule {}
