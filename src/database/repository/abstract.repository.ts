import {
	EntityManager,
	EntitySubscriberInterface,
	QueryRunner,
	Repository,
} from 'typeorm';
import {v4 as uuidv4} from 'uuid';
import {DatabaseException} from '@warp-core/database/exception/database.exception';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
import {Inject} from '@nestjs/common';

export abstract class AbstractRepository<
	T extends Object,
> extends Repository<T> {
	@Inject(TransactionManagerService)
	private static transactionManager: TransactionManagerService;

	private static disabledEntityListeners: Map<
		Function | string,
		EntitySubscriberInterface
	> = new Map<Function | string, EntitySubscriberInterface>();

	/**
	 * Creates shared transaction.
	 * Shared transaction allows using transactions in different modules
	 * and different scopes.
	 */
	async startTransaction(): Promise<void> {
		await AbstractRepository.transactionManager.startTransaction();
	}

	/**
	 * Commit transaction
	 */
	async commitTransaction() {
		await AbstractRepository.transactionManager.commitTransaction();
	}

	/**
	 * Rollback transaction
	 */
	async rollbackTransaction() {
		await AbstractRepository.transactionManager.rollbackTransaction();
	}

	public disableEntityListeners(
		entityType: Function | Function[] | string | string[],
	) {
		const entityTypesToCheck = Array.isArray(entityType)
			? entityType
			: [entityType];

		const subscriber = this.manager.connection.subscribers;
		for (let i = subscriber.length - 1; i >= 0; --i) {
			const subscriberElement = subscriber[i];

			// @ts-ignore
			if (entityTypesToCheck.includes(subscriberElement.listenTo())) {
				AbstractRepository.disabledEntityListeners.set(
					// @ts-ignore
					subscriberElement.listenTo(),
					subscriberElement,
				);
				subscriber.splice(subscriber.indexOf(subscriberElement), 1);
			}
		}
	}

	public enableEntityListeners(
		entityType: Function | Function[] | string | string[],
	) {
		const entityTypesToCheck = Array.isArray(entityType)
			? entityType
			: [entityType];
		const subscriber = this.manager.connection.subscribers;

		for (const entityTypesToCheckElement of entityTypesToCheck) {
			const disabledEntity = AbstractRepository.disabledEntityListeners.get(
				entityTypesToCheckElement,
			);
			// @ts-ignore
			subscriber.push(disabledEntity);
			AbstractRepository.disabledEntityListeners.delete(
				entityTypesToCheckElement,
			);
		}
	}
}
