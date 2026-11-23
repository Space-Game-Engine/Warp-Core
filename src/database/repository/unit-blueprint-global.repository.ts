import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class UnitBlueprintGlobalRepository extends AbstractRepository<UnitBlueprintGlobalModel> {
	constructor(private dataSource: DataSource) {
		super(UnitBlueprintGlobalModel, dataSource.createEntityManager());
	}

	public getUnitById(unitId: string): Promise<UnitBlueprintGlobalModel | null> {
		return this.findOne({where: {id: unitId}});
	}

	public getAllUnits(): Promise<UnitBlueprintGlobalModel[]> {
		return this.find();
	}
}
