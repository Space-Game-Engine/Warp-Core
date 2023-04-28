import { EntityManager, Repository } from "typeorm";

export abstract class AbstractRepository<T extends Object> extends Repository<T> {
    public transaction(runInTransaction: (entityManager: EntityManager) => Promise<unknown>) {
        return this.manager.transaction(runInTransaction)
    }
}