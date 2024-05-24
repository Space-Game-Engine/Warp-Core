import {HttpStatus} from '@nestjs/common';
import * as supertest from 'supertest';

import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {
	generateGraphQLQuery,
	GraphQLQueryParameters,
	GraphQLQueryVariables, OperationType,
} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-query-generator';


export class GraphqlRequestTest {
	private queryParameters: GraphQLQueryParameters;
	private operationName: OperationType;
	private readonly serverPath = '/graphql';
	private loginToken: string;

	constructor(private readonly supertest: supertest.Agent) {}

	async register(userId: number): Promise<LoginParameters> {
		const registerResponse = await this.supertest.get(`/auth/create/${userId}`);

		return registerResponse.body;
	}

	async authenticate(loginParameters: LoginParameters): Promise<this> {
		const loginResponse = await this.supertest.post('/auth/login').send(loginParameters).expect(HttpStatus.CREATED);

		this.loginToken = loginResponse.body.access_token;

		return this;
	}

	async registerAndAuthenticate(userId: number): Promise<this> {
		const loginParameters = await this.register(userId);

		await this.authenticate(loginParameters);

		return this;
	}

	query(queryParameters: GraphQLQueryParameters): this {
		return this.prepareQuery('query', queryParameters);
	}

	mutation(queryParameters: GraphQLQueryParameters): this {
		return this.prepareQuery('mutation', queryParameters);
	}

	private prepareQuery(operationName: OperationType, queryParameters: GraphQLQueryParameters): this {
		this.operationName = operationName;
		this.queryParameters = queryParameters;

		return this;
	}

	variables(variables: GraphQLQueryVariables): this {
		this.queryParameters.variables = variables;

		return this;
	}

	send() {
		return this.supertest
			.post(this.serverPath)
			.set('Authorization', this.prepareAuthHeader())
			.accept('application/json')
			.send(this.preparePayload());
	}

	private preparePayload() {
		return generateGraphQLQuery(this.operationName, this.queryParameters);
	}

	private prepareAuthHeader() {
		if (this.loginToken) {
			return this.loginToken;
		}

		return '';
	}
}
