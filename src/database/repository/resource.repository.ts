import {Injectable} from '@nestjs/common';
import {ResourceModel} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';
import {DataSource} from 'typeorm';

@Injectable()
export class ResourceRepository extends AbstractRepository<ResourceModel> {
	constructor(private dataSource: DataSource) {
		super(ResourceModel, dataSource.createEntityManager());
	}
}
