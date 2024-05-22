import {agent} from 'supertest';

import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';

export function requestGraphQL(app: any) {
	const supertest = agent(app);

	return new GraphqlRequestTest(supertest);
}
