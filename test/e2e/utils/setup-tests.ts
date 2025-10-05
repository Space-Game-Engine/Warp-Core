import 'reflect-metadata';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {getDataSourceToken} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

import {AppModule} from '@warp-core/app.module';
import {InstallCommand} from '@warp-core/core/install/install.command';
import {InstallModule} from '@warp-core/core/install/install.module';
import {toHaveResourceWithValue} from '@warp-core/test/expect-extend/resource-assert';

expect.extend({toHaveResourceWithValue});

export async function createNestApplicationE2E(): Promise<INestApplication> {
	const module = await Test.createTestingModule({
		imports: [AppModule, InstallModule.register()],
	}).compile();
	const app = module.createNestApplication();

	return app.init();
}

beforeAll(async () => {});

beforeEach(async () => {
	const app = await createNestApplicationE2E();
	const connection = app.get<DataSource>(getDataSourceToken());

	await connection.dropDatabase();
	await connection.synchronize();

	const install = app.get(InstallCommand);
	await install.install(process.env.INSTALLATION_DIRECTORY!);
	return app.close();
});

afterEach(async () => {});

afterAll(async () => {});
