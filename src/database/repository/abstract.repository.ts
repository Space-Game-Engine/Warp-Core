import {EntityManager, QueryRunner, Repository} from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import {DatabaseException} from "@warp-core/database/exception/database.exception";

export abstract class AbstractRepository<T extends Object> extends Repository<T> {

    private static sharedTransactions: Map<string, QueryRunner> = new Map<string, QueryRunner>();

    /**
     * Creates shared transaction. Shared transaction allows to use transactions in different modules
     * and different scopes. Each transaction is a different database connection, as described in
     * documentation https://orkhan.gitbook.io/typeorm/docs/transactions#using-queryrunner-to-create-and-control-state-of-single-database-connection
     */
    async createSharedTransaction(): Promise<[string, EntityManager]> {
        const transactionId = uuidv4();
        const queryRunner = this.manager.connection.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        AbstractRepository.sharedTransactions.set(transactionId, queryRunner);

        return [transactionId, queryRunner.manager];
    }

    /**
     * Retrieve currently saved transactions
     * @param transactionId
     * @private
     */
    private getSharedTransactionRunner(transactionId: string): QueryRunner {
        if (AbstractRepository.sharedTransactions.has(transactionId)) {
            return AbstractRepository.sharedTransactions.get(transactionId);
        }

        throw new DatabaseException("Transaction for provided Id does not exists");
    }

    /**
     * Releases currently saved transactions
     * @param transactionId
     * @private
     */
    private async releaseSharedTransactionRunner(transactionId: string) {
        const transaction = this.getSharedTransactionRunner(transactionId);
        await transaction.release();

        AbstractRepository.sharedTransactions.delete(transactionId);

    }

    /**
     * Get current transaction to perform actions
     * @param transactionId
     */
    getSharedTransaction(transactionId: string): EntityManager {
        return this.getSharedTransactionRunner(transactionId).manager;
    }

    /**
     * Commit transaction and release additional connection to database
     * @param transactionId
     */
    async commitSharedTransaction(transactionId: string) {
        const transaction = this.getSharedTransactionRunner(transactionId);

        await transaction.commitTransaction();

        await this.releaseSharedTransactionRunner(transactionId);
    }

    /**
     * Rollback transaction and release additional connection to database
     * @param transactionId
     */
    async rollbackSharedTransaction(transactionId: string) {
        const transaction = this.getSharedTransactionRunner(transactionId);

        await transaction.rollbackTransaction();

        await this.releaseSharedTransactionRunner(transactionId);
    }

    public transaction(runInTransaction: (entityManager: EntityManager) => Promise<unknown>) {
        return this.manager.transaction(runInTransaction)
    }
}