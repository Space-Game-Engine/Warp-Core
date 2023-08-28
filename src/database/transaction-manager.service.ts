import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {BuildingModel} from '@warp-core/database/model';

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