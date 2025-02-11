import {Module} from '@nestjs/common';

import {BuildingQueueModule} from '@warp-core/user/queue/building-queue';

@Module({
	imports: [BuildingQueueModule],
})
export class QueueModule {}
