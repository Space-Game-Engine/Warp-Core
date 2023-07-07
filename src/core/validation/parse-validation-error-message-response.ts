import {UnprocessableEntityException} from "@nestjs/common";
import {GraphQLError} from "graphql/error";

export function parseValidationErrorMessageResponse(graphQLError: GraphQLError, error: any) {
    if (error.originalError instanceof UnprocessableEntityException) {
        const errorResponse = {
            message: error.message,
            validationError: [],
        };

        if ('message' in error.originalError.response) {
            errorResponse.validationError = error.originalError.response.message;
        } else {
            errorResponse.validationError = error.originalError.response;
        }

        return errorResponse;
    }

    return graphQLError;
}