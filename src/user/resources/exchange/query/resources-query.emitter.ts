import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {ResourcesQueryNames} from '@warp-core/user/resources/exchange/query/resources-query.names';

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
