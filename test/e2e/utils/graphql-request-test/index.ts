import { agent } from "supertest";
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
const supertestGraphQL = (app: any) => {
	const supertest = agent(app);

	return new GraphqlRequestTest(supertest);
}

export default supertestGraphQL;