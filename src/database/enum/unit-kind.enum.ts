import {registerEnumType} from '@nestjs/graphql';

export enum UnitKindEnum {
	MOBILE = 'mobile',
	STATIONARY = 'stationary',
}

registerEnumType(UnitKindEnum, {
	name: 'Unit_kind',
	description: 'What kind of unit is it?',
	valuesMap: {
		MOBILE: {
			description: 'Unit is able to move between places',
		},
		STATIONARY: {
			description: 'Unit stays where it was created',
		},
	},
});
