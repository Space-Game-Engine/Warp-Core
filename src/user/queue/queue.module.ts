import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {BuildingQueueModule} from '@warp-core/user/queue/building-queue/building-queue.module';
import {QueueConsumerMiddleware} from '@warp-core/user/queue/queue-consumer.middleware';
import {ResearchQueueModule} from '@warp-core/user/queue/research-queue/research-queue.module';

@Module({
	providers: [QueueConsumerMiddleware],
	imports: [AuthModule, BuildingQueueModule, ResearchQueueModule],
})
export class QueueModule implements NestModule {
	public configure(consumer: MiddlewareConsumer): void {
		consumer.apply(QueueConsumerMiddleware).forRoutes('graphql');
	}
}
