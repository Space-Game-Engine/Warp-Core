import {Inject, Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';

import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

@Injectable()
export abstract class AbstractRepository<
	T extends object,
> extends Repository<T> {
	@Inject(TransactionManagerService)
	private readonly transactionManager: TransactionManagerService;

	/**
	 * Creates shared transaction.
	 * Shared transaction allows using transactions in different modules
	 * and different scopes.
	 */
	public startTransaction(): Promise<void> {
		return this.transactionManager.startTransaction();
	}

	/**
	 * Commit transaction
	 */
	public commitTransaction(): Promise<void> {
		return this.transactionManager.commitTransaction();
	}

	/**
	 * Rollback transaction
	 */
	public rollbackTransaction(): Promise<void> {
		return this.transactionManager.rollbackTransaction();
	}
}
