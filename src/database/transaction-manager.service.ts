import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

@Injectable()
export class TransactionManagerService {

	constructor(private dataSource: DataSource) {}

	public async startTransaction() {
		this.dataSource.manager.queryRunner?.startTransaction();
	}

	public async commitTransaction() {
		this.dataSource.manager.queryRunner?.commitTransaction();
	}

	public async rollbackTransaction() {
		this.dataSource.manager.queryRunner?.rollbackTransaction();
	}
}