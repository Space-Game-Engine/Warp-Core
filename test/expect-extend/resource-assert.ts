import CustomMatcherResult = jest.CustomMatcherResult;
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';

type ExactResourceCheck = {
	value: number;
};

type RangeResourceCheck = {
	minValue: number;
	maxValue: number;
};

export type ResourceCheck = {
	resourceId: string;
} & (ExactResourceCheck | RangeResourceCheck);
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

	const {resourceId} = actual;

	const resourceToCheck = getResourceFromReceivedResources(
		received as HabitatResourceCombined[],
		resourceId,
	)!;

	if ('value' in actual) {
		return checkExactResourceValue(resourceToCheck, actual.value);
	}

	return checkResourceValueInRange(
		resourceToCheck,
		actual.minValue,
		actual.maxValue,
	);
}

function checkExactResourceValue(
	resourceToCheck: Partial<HabitatResourceCombined>,
	exactValue: number,
): CustomMatcherResult {
	return {
		pass: exactValue === resourceToCheck.currentAmount,
		message: () =>
			`Resource "${resourceToCheck.resourceId}" amount should be ${exactValue}, actual value is ${resourceToCheck.currentAmount}`,
	};
}

function checkResourceValueInRange(
	resourceToCheck: Partial<HabitatResourceCombined>,
	minValue: number,
	maxValue: number,
): CustomMatcherResult {
	const currentAmount = resourceToCheck.currentAmount ?? 0;
	const minValuePass = minValue <= currentAmount;
	const maxValuePass = maxValue >= currentAmount;
	return {
		pass: minValuePass === maxValuePass,
		message: () =>
			`Resource "${resourceToCheck.resourceId}" amount should be between ${minValue} and ${maxValue}, actual value is ${resourceToCheck.currentAmount}`,
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
