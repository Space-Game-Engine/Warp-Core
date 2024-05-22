import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {AppModule} from '@warp-core/app.module';

export async function e2eModule(): Promise<TestingModule> {
	return await Test.createTestingModule({imports: [AppModule]}).compile();
}

export async function createNestApplicationE2E(): Promise<INestApplication> {
	const module = await e2eModule();
	const app = module.createNestApplication();

	await app.init();

	return app;
}
