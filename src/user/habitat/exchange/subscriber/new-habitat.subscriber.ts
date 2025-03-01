import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {CreateFirstUserHabitatInput} from '@warp-core/user/habitat/exchange';
import {HabitatNames} from '@warp-core/user/habitat/exchange/query/habitat.names';
import {CreateNewHabitatService} from '@warp-core/user/habitat/service/create-new-habitat.service';

@Injectable()
export class NewHabitatSubscriber {
	constructor(private readonly newHabitatService: CreateNewHabitatService) {}

	@InternalExchangeQuery(HabitatNames.CreateFirstUserHabitat)
	public createNewHabitat(
		input: CreateFirstUserHabitatInput,
	): Promise<HabitatModel> {
		return this.newHabitatService.createHabitatOnUserRegistration(input);
	}
}
