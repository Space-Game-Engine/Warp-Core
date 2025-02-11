import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

@Injectable()
export class TransactionManagerService {
	constructor(private dataSource: DataSource) {}

	public startTransaction(): Promise<void> {
		return this.dataSource.manager.queryRunner!.startTransaction();
	}

	public commitTransaction(): Promise<void> {
		return this.dataSource.manager.queryRunner!.commitTransaction();
	}

	public rollbackTransaction(): Promise<void> {
		return this.dataSource.manager.queryRunner!.rollbackTransaction();
	}
}
