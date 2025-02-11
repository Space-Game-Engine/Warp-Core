import {agent} from 'supertest';
import {App} from 'supertest/types';

import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';

export function requestGraphQL(app: App): GraphqlRequestTest {
	const supertest = agent(app);

	return new GraphqlRequestTest(supertest);
}
