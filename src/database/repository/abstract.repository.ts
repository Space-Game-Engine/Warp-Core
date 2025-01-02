import {Inject, Injectable} from '@nestjs/common';
import {EntitySubscriberInterface, Repository} from 'typeorm';

import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

@Injectable()
export abstract class AbstractRepository<
	T extends object,
> extends Repository<T> {
	@Inject(TransactionManagerService)
	private readonly transactionManager: TransactionManagerService;

	private static disabledEntityListeners: Map<
		object | string,
		EntitySubscriberInterface
	> = new Map<object | string, EntitySubscriberInterface>();

	/**
	 * Creates shared transaction.
	 * Shared transaction allows using transactions in different modules
	 * and different scopes.
	 */
	public async startTransaction(): Promise<void> {
		await this.transactionManager.startTransaction();
	}

	/**
	 * Commit transaction
	 */
	public async commitTransaction(): Promise<void> {
		await this.transactionManager.commitTransaction();
	}

	/**
	 * Rollback transaction
	 */
	public async rollbackTransaction(): Promise<void> {
		await this.transactionManager.rollbackTransaction();
	}

	public disableEntityListeners(
		entityType: object | object[] | string | string[],
	): void {
		const entityTypesToCheck = Array.isArray(entityType)
			? entityType
			: [entityType];

		const subscriber = this.manager.connection.subscribers;
		for (let i = subscriber.length - 1; i >= 0; --i) {
			const subscriberElement = subscriber[i];

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			if (entityTypesToCheck.includes(subscriberElement.listenTo())) {
				AbstractRepository.disabledEntityListeners.set(
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					subscriberElement.listenTo(),
					subscriberElement,
				);
				subscriber.splice(subscriber.indexOf(subscriberElement), 1);
			}
		}
	}

	public enableEntityListeners(
		entityType: object | object[] | string | string[],
	): void {
		const entityTypesToCheck = Array.isArray(entityType)
			? entityType
			: [entityType];
		const subscriber = this.manager.connection.subscribers;

		for (const entityTypesToCheckElement of entityTypesToCheck) {
			const disabledEntity = AbstractRepository.disabledEntityListeners.get(
				entityTypesToCheckElement,
			);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			subscriber.push(disabledEntity);
			AbstractRepository.disabledEntityListeners.delete(
				entityTypesToCheckElement,
			);
		}
	}
}
