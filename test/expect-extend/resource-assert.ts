import CustomMatcherResult = jest.CustomMatcherResult;
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';

export type ResourceCheck = {
	resourceId: string;
	value: number;
};
export type ResourceWithCustomPropertyCheck = {
	resourceId: string;
	property: string;
	value: number;
};

function getResourceFromReceivedResources(
	received: HabitatResourceCombined[],
	resourceId: string,
): undefined | Partial<HabitatResourceCombined> {
	return received.find(singleResource => {
		return singleResource.id === resourceId;
	});
}

export function toHaveResource(
	received: unknown,
	actual: {resourceId: string},
): CustomMatcherResult {
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

	const {resourceId} = actual;

	const resourceToCheck = getResourceFromReceivedResources(
		received,
		resourceId,
	);

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
		pass: true,
		message: () => '',
	};
}

export function toHaveResourceWithValue(
	received: unknown,
	actual: ResourceCheck,
): CustomMatcherResult {
	const resourceAssert = toHaveResource(received, actual);

	if (!resourceAssert.pass) {
		return resourceAssert;
	}

	const {resourceId, value} = actual;

	const resourceToCheck = getResourceFromReceivedResources(
		received as HabitatResourceCombined[],
		resourceId,
	)!;

	return {
		pass: value === resourceToCheck.currentAmount,
		message: () =>
			`Resource "${resourceId}" amount should be ${value}, actual value is ${resourceToCheck.currentAmount}`,
	};
}

export function toHaveResourceWithCustomProperty(
	received: unknown,
	actual: ResourceWithCustomPropertyCheck,
): CustomMatcherResult {
	const resourceAssert = toHaveResource(received, actual);

	if (!resourceAssert.pass) {
		return resourceAssert;
	}

	const {resourceId, value, property} = actual;

	const resourceToCheck = getResourceFromReceivedResources(
		received as HabitatResourceCombined[],
		resourceId,
	)!;

	return {
		pass: value === resourceToCheck[property],
		message: () =>
			`Resource "${resourceId}" for field "${property}" should be ${value}, actual value is ${resourceToCheck[property]}`,
	};
}
