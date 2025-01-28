import {Inject, Injectable} from '@nestjs/common';

import {HabitatResourceCombined} from '@warp-core/database';
import {ResourcesQueryNames} from '@warp-core/user/resources/exchange/query/resources-query.names';
import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from 'src/core/utils/internal-exchange';

@Injectable()
export class ResourcesQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getResourcesPerHabitat(
		habitatId: number,
	): Promise<QueryExchangeResponse<HabitatResourceCombined[]>> {
		return this.emitter.query<HabitatResourceCombined[]>({
			eventName: ResourcesQueryNames.GetResourcesPerHabitat,
			requestData: {habitatId},
		});
	}
}
