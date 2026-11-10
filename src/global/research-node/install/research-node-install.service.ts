import {Injectable, Type} from '@nestjs/common';

import {
	AbstractInstallationService,
	LoadedConfig,
} from '@warp-core/core/install';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';

@Injectable()
export class ResearchNodeInstallService extends AbstractInstallationService<ResearchNodeModel> {
	protected modelType(): Type<ResearchNodeModel> {
		return ResearchNodeModel;
	}

	protected parseConfig(loadedConfig: LoadedConfig): ResearchNodeModel[] {
		return (loadedConfig.researchNodes ?? []) as ResearchNodeModel[];
	}
}
