import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {ResourceModel} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class ResourceRepository extends AbstractRepository<ResourceModel> {
	constructor(private dataSource: DataSource) {
		super(ResourceModel, dataSource.createEntityManager());
	}
}
