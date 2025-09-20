import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

@Injectable()
@AddMechanic(WarehouseStorageCalculationMechanic, 'disabled')
export class DisabledWarehouseStorageService
	implements WarehouseStorageCalculationMechanic
{
	public async calculateStorage(): Promise<number> {
		return Number.MAX_SAFE_INTEGER;
	}
}
