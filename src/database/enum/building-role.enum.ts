import {registerEnumType} from '@nestjs/graphql';

export enum BuildingRoleEnum {
	RESOURCE_PRODUCTION = 'resource',
	TECHNOLOGY_PRODUCTION = 'technology',
	UNIT_PRODUCTION = 'unit',
	WAREHOUSE_ONLY = 'warehouse',
}

registerEnumType(BuildingRoleEnum, {
	name: 'Building_role',
	description: 'What kind of buildings are available?',
	valuesMap: {
		RESOURCE_PRODUCTION: {
			description: 'Produces one or more types of resources',
		},
		TECHNOLOGY_PRODUCTION: {
			description: 'Enables technological development',
		},
		UNIT_PRODUCTION: {
			description: 'recruits units for the army',
		},
		WAREHOUSE_ONLY: {
			description: 'Store some resources according to their type',
		},
	},
});
