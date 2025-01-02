import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {InstallationDetailsModel} from '@warp-core/database/model/installation-details.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class InstallationDetailsRepository extends AbstractRepository<InstallationDetailsModel> {
	constructor(private dataSource: DataSource) {
		super(InstallationDetailsModel, dataSource.createEntityManager());
	}

	public async isPossibleToInstallGame(): Promise<boolean> {
		return (await this.count()) === 0;
	}
}
