import CustomMatcher = jest.CustomMatcher;
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';

export type ResourceCheck = {
	resourceId: string;
	value: number;
};

export const toHaveResourceWithValue: CustomMatcher = (
	received: unknown,
	actual: ResourceCheck,
) => {
	if (!received) {
		return {
			pass: false,
			message: () => 'Resource array should exist',
		};
	}

	if (!Array.isArray(received)) {
		return {
			pass: false,
			message: () => 'Resources should be an array',
		};
	}

	const {resourceId, value} = actual;

	const resourceToCheck = received.find(singleResource => {
		return singleResource.id === resourceId;
	}) as undefined | Partial<HabitatResourceCombined>;

	if (!resourceToCheck) {
		return {
			pass: false,
			message: () => `Resource "${resourceId}" does not exists`,
		};
	}

	if (!resourceToCheck.hasOwnProperty('currentAmount')) {
		return {
			pass: false,
			message: () =>
				`Resource object "${resourceId}" does not have currentAmount property, may no be proper HabitatResourceCombined object`,
		};
	}

	return {
		pass: value === resourceToCheck.currentAmount,
		message: () =>
			`Resource "${resourceId}" amount should be ${value}, actual value is ${resourceToCheck.currentAmount}`,
	};
};
