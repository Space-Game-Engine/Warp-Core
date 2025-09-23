import {
	ResourceCheck,
	toHaveResourceWithValue,
} from '@warp-core/test/expect-extend/resource-assert';

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveResourceWithValue(expected: ResourceCheck): R
		}
	}
}

export {};