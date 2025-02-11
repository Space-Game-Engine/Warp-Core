import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {TypeOrmModule} from '@nestjs/typeorm';

import {AppModule} from '@warp-core/app.module';
import {datasource} from '@warp-core/test/e2e/utils/dataSource';

export async function e2eModule(): Promise<TestingModule> {
	const builder = Test.createTestingModule({imports: [AppModule]});
	const overrideTypeORM = builder.overrideModule(TypeOrmModule);
	overrideTypeORM.useModule(
		TypeOrmModule.forRootAsync({
			dataSourceFactory: async () => datasource.initialize(),
		}),
	);

	return await builder.compile();
}

export async function createNestApplicationE2E(): Promise<INestApplication> {
	const module = await e2eModule();
	const app = module.createNestApplication();

	await app.init();

	return app;
}
