import {registerEnumType} from '@nestjs/graphql';

export enum ResourceTypeEnum {
	CONSTRUCTION_RESOURCE = 'construction',
	ENERGY_RESOURCE = 'energy',
	TECHNOLOGY_RESOURCE = 'technology',
}

registerEnumType(ResourceTypeEnum, {
	name: 'Resource_type',
	description: 'What kind of resources are possible to create?',
	valuesMap: {
		CONSTRUCTION_RESOURCE: {
			description: 'Resources used for build buildings',
		},
		ENERGY_RESOURCE: {
			description: 'Resources used to power buildings and unlock technology',
		},
		TECHNOLOGY_RESOURCE: {
			description: 'Resources used in technological actions',
		},
	},
});
