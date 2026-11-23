import {Injectable} from '@nestjs/common';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitBlueprintGlobalRepository} from '@warp-core/database/repository/unit-blueprint-global.repository';

@Injectable()
export class UnitService {
	constructor(private readonly unitRepository: UnitBlueprintGlobalRepository) {}

	public getUnitById(unitId: string): Promise<UnitBlueprintGlobalModel | null> {
		return this.unitRepository.getUnitById(unitId);
	}

	public getAllUnits(): Promise<UnitBlueprintGlobalModel[]> {
		return this.unitRepository.getAllUnits();
	}
}
