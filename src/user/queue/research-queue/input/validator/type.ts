import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

export type ResearchQueueInputValidation = {
	addToQueueInput: AddResearchToQueueInput;
	researchNode: ResearchNodeModel;
	habitatResearchNode: HabitatResearchNodeModel | null;
	validationError: QueueValidationError;
};
