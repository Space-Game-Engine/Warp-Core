import {Injectable} from '@nestjs/common';
import {DataSource, QueryRunner} from 'typeorm';

@Injectable()
export class TransactionManagerService {
	private queryRunner: QueryRunner;
	constructor(private dataSource: DataSource) {}

	public startTransaction(): Promise<void> {
		const queryRunner = this.getQueryRunner();
		return queryRunner.startTransaction();
	}

	public commitTransaction(): Promise<void> {
		const queryRunner = this.getQueryRunner();
		return queryRunner.commitTransaction();
	}

	public rollbackTransaction(): Promise<void> {
		const queryRunner = this.getQueryRunner();
		return queryRunner.rollbackTransaction();
	}

	private getQueryRunner(): QueryRunner {
		if (!this.queryRunner) {
			this.queryRunner = this.dataSource.manager.connection.createQueryRunner();
		}
		return this.queryRunner;
	}
}
