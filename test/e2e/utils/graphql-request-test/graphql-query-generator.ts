export type GraphQLQueryVariableDetails = {
	value: unknown;
	type: 'Int' | 'Float' | 'ID' | 'string';
};

export type GraphQLQueryVariables = {
	[key: string]: GraphQLQueryVariableDetails;
};

export type GraphQLQueryFields = {
	fields?: string[];
	[key: string]: GraphQLQueryFields | string[] | undefined;
};

export type GraphQLQueryParameters = {
	root: string;
	fields: GraphQLQueryFields;
	variables?: GraphQLQueryVariables | undefined;
	operationName?: string;
};

export type OperationType = 'query' | 'mutation';

export function generateGraphQLQuery(
	operationType: OperationType,
	{root, fields, variables, operationName}: GraphQLQueryParameters,
): {query: string; variables: {[p: string]: string}} {
	const {functionArguments, queryVariables, variablesWithValues} =
		prepareDynamicVariablesForQuery(variables ?? {});
	const mainQuery = `${operationType} ${operationName ?? ''}${queryVariables} {
			${root} ${functionArguments} {
				${processFields(fields)}
			} 
		}`;

	return {
		query: mainQuery,
		variables: variablesWithValues,
	};
}

function prepareDynamicVariablesForQuery(variables: GraphQLQueryVariables): {
	functionArguments: string;
	queryVariables: string;
	variablesWithValues: {[key: string]: string};
} {
	const dynamicVariables = {
		functionArguments: '',
		queryVariables: '',
		variablesWithValues: {},
	};

	if (Object.keys(variables).length === 0) {
		return dynamicVariables;
	}

	const functionArguments = {},
		variablesAcceptedByQuery = {},
		variablesWithValues = {};
	for (const fieldName in variables) {
		const {type, value} = variables[fieldName];
		const variableName = '$' + fieldName;
		functionArguments[fieldName] = variableName;
		variablesAcceptedByQuery[variableName] = type + '!';
		variablesWithValues[fieldName] = value;
	}

	dynamicVariables.functionArguments = `(${stringifyArguments(
		functionArguments,
	)})`;
	dynamicVariables.queryVariables = `(${stringifyArguments(
		variablesAcceptedByQuery,
	)})`;
	dynamicVariables.variablesWithValues = variablesWithValues;

	return dynamicVariables;
}

function stringifyArguments(argumentsToStringify: {
	[key: string]: string;
}): string {
	const preparedArguments: string[] = [];
	for (const argumentKey in argumentsToStringify) {
		const argumentValue = argumentsToStringify[argumentKey];

		preparedArguments.push(`${argumentKey}: ${argumentValue}`);
	}

	return preparedArguments.join(', ');
}

function processFields(fields: GraphQLQueryFields): string {
	let queryParts: string[] = [];

	if (fields.fields && fields.fields.length > 0) {
		queryParts = queryParts.concat(fields.fields);
	}

	for (const key in fields) {
		if (key !== 'fields' && fields[key] !== undefined) {
			queryParts.push(
				`${key} { ${processFields(fields[key] as GraphQLQueryFields)} }`,
			);
		}
	}

	return queryParts.join(' ');
}
