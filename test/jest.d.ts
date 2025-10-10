import {
	ResourceCheck,
	ResourceWithCustomPropertyCheck,
	toHaveResource,
	toHaveResourceWithCustomProperty,
	toHaveResourceWithValue,
} from '@warp-core/test/expect-extend/resource-assert';

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveResource(expected: {id: string}): R
			toHaveResourceWithValue(expected: ResourceCheck): R
			toHaveResourceWithCustomProperty(expected: ResourceWithCustomPropertyCheck): R
		}
	}
}

export {};