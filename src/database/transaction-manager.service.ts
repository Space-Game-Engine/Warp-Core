import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

@Injectable()
export class TransactionManagerService {
	constructor(private dataSource: DataSource) {}

	public async startTransaction(): Promise<void> {
		this.dataSource.manager.queryRunner?.startTransaction();
	}

	public async commitTransaction(): Promise<void> {
		this.dataSource.manager.queryRunner?.commitTransaction();
	}

	public async rollbackTransaction(): Promise<void> {
		this.dataSource.manager.queryRunner?.rollbackTransaction();
	}
}
