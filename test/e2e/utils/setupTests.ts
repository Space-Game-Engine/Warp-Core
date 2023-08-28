import 'reflect-metadata';
import {datasource} from '@warp-core/test/e2e/utils/dataSource';

jest.mock('@warp-core/database/transaction-manager.service');

beforeEach(() => {
	datasource.manager.queryRunner?.startTransaction();
});

afterEach(() => {
	datasource.manager.queryRunner?.rollbackTransaction();
});