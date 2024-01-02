
import * as supertest from 'supertest';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {HttpStatus} from '@nestjs/common';

type GraphQLVariables = { [key: string]: unknown };
type Operation = 'query' | 'mutation';

export class GraphqlRequestTest {
	private graphQLQuery: string;
	private queryVariables: GraphQLVariables | undefined;
	private operationName: Operation;
	private serverPath = '/graphql';
	private loginToken: string;

	constructor(
		private readonly supertest: supertest.Agent
	) {
	}

	async authenticate(loginParameters: LoginParameters) {
		const loginResponse = await this.supertest
			.post('/auth/login')
			.send(loginParameters)
			.expect(HttpStatus.CREATED);

		this.loginToken = loginResponse.body.access_token;

		return this;
	}

	query(query: string, variables?: GraphQLVariables): this {
		return this.prepareQuery('query', query, variables);
	}

	mutation(query: string, variables?: GraphQLVariables): this {
		return this.prepareQuery('mutation', query, variables);
	}

	private prepareQuery(operationName: Operation, query: string, variables?: GraphQLVariables): this {
		this.operationName = operationName;
		this.graphQLQuery = query;
		this.queryVariables = variables;
		return this;
	}

	variables(variables: GraphQLVariables): this {
		this.queryVariables = variables;
		return this;
	}

	send() {
		return this.supertest
			.post(this.serverPath)
			.set('Authorization', this.prepareAuthHeader())
			.accept("application/json")
			.send(this.preparePayload());
	}

	private preparePayload() {
		return {
			query: `${this.operationName} ${this.graphQLQuery}`,
		}
	}

	private prepareAuthHeader() {
		if (this.loginToken) {
			return this.loginToken;
		}

		return '';
	}
}