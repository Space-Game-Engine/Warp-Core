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
			description: 'Thanks to that resources, you can build',
		},
		ENERGY_RESOURCE: {
			description:
				'Energy resource will be used for buildings and to gain technology',
		},
		TECHNOLOGY_RESOURCE: {
			description: 'Every technology created is stored here',
		},
	},
});
