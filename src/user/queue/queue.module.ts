import {Module} from '@nestjs/common';

import {BuildingQueueModule} from '@warp-core/user/queue/building-queue/building-queue.module';

@Module({
	imports: [BuildingQueueModule],
})
export class QueueModule {}
