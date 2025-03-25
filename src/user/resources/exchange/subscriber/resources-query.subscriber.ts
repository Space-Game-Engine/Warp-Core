import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {ResourcesQueryNames} from '@warp-core/user/resources/exchange/query/resources-query.names';
import {ResourcesService} from '@warp-core/user/resources/service/resources.service';

@Injectable()
export class ResourcesQuerySubscriber {
	constructor(private readonly resourceService: ResourcesService) {}

	@InternalExchangeQuery(ResourcesQueryNames.GetResourcesPerHabitat)
	public getResourcesPerHabitat(input: {
		habitatId: number;
	}): Promise<HabitatResourceCombined[]> {
		return this.resourceService.getAllResourcesForHabitat(input.habitatId);
	}
}
