import {Injectable} from '@nestjs/common';

import {HabitatResourceCombined} from '@warp-core/database';
import {ResourcesQueryNames} from '@warp-core/user/resources/exchange/query/resources-query.names';
import {ResourcesService} from '@warp-core/user/resources/resources.service';
import {InternalExchangeQuery} from 'src/core/utils/internal-exchange';

@Injectable()
export class ResourcesQueryHandler {
	constructor(private readonly resourceService: ResourcesService) {}

	@InternalExchangeQuery(ResourcesQueryNames.GetResourcesPerHabitat)
	public getResourcesPerHabitat(input: {
		habitatId: number;
	}): Promise<HabitatResourceCombined[]> {
		return this.resourceService.getAllResourcesForHabitat(input.habitatId);
	}
}
