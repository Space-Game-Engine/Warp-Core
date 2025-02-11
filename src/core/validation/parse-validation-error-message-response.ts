import {UnprocessableEntityException} from '@nestjs/common';
import {GraphQLError} from 'graphql/error';

type ErrorResponse = {message: string; validationError: string[]};

export function parseValidationErrorMessageResponse(
	graphQLError: GraphQLError,
	error: unknown,
): GraphQLError | ErrorResponse {
	if (validateErrorObject(error)) {
		const errorResponse: ErrorResponse = {
			message: error.message,
			validationError: [],
		};
		const originalError = error.originalError.getResponse();

		if (typeof originalError === 'string') {
			errorResponse.validationError = [originalError];
		} else {
			errorResponse.validationError = originalError as string[];
		}

		return errorResponse;
	}

	return graphQLError;
}

function validateErrorObject(
	error: unknown,
): error is Error & {originalError: UnprocessableEntityException} {
	if (!error) {
		return false;
	}
	if (typeof error !== 'object') {
		return false;
	}
	if (!('originalError' in error)) {
		return false;
	}
	if (!('message' in error)) {
		return false;
	}

	return error.originalError instanceof UnprocessableEntityException;
}
