import { Matcher, MatcherCreator } from 'jest-mock-extended';

export const isEqual: MatcherCreator<any> = expectedValue => new Matcher((actualValue) => {
    return compareValue(expectedValue, actualValue);
}, 'Values are not equal');

function compareValue(expectedValue: any, actualValue: any): boolean {
    if (typeof actualValue !== typeof expectedValue) {
        return false;
    }

    if ('object' === typeof actualValue) {
        return compareObject(expectedValue, actualValue);
    }

    return expectedValue === actualValue;
}

function compareObject(expectedValue: object, actualValue: object): boolean {
    for (const key in expectedValue) {
        if (false === compareValue(expectedValue[key], actualValue[key])) {
            return false;
        }
    }

    return true;
}