import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {CreateFirstUserHabitatInput} from '@warp-core/user/habitat/exchange';
import {HabitatNames} from '@warp-core/user/habitat/exchange/query/habitat.names';

@Injectable()
export class HabitatEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public createFirstUserHabitat(
		input: CreateFirstUserHabitatInput,
	): Promise<QueryExchangeResponse<HabitatModel>> {
		return this.emitter.query<HabitatModel>({
			eventName: HabitatNames.CreateFirstUserHabitat,
			requestData: input,
		});
	}
}
