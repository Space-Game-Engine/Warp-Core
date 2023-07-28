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
			description: 'Creates one or more types of resource',
		},
		TECHNOLOGY_PRODUCTION: {
			description: 'Develop some kind of technology',
		},
		UNIT_PRODUCTION: {
			description: 'Recruit units for your army',
		},
		WAREHOUSE_ONLY: {
			description:
				"That building only stores some resources, don't have any other role.",
		},
	},
});
