import 'reflect-metadata';
import {datasource} from '@warp-core/test/e2e/utils/dataSource';

jest.mock('@warp-core/database/transaction-manager.service');

beforeEach(async () => {
	return datasource.manager.queryRunner?.startTransaction();
});

afterEach(async () => {
	return datasource.manager.queryRunner?.rollbackTransaction();
});
