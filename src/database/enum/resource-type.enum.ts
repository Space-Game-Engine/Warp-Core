import {registerEnumType} from '@nestjs/graphql';

export enum ResourceTypeEnum {
	CONSTRUCTION_RESOURCE = 'construction',
	ENERGY_RESOURCE = 'energy',
	TECHNOLOGY_ITEM_RESOURCE = 'technology item',
}

registerEnumType(ResourceTypeEnum, {
	name: 'Resource_type',
	description: 'What kind of resources are possible to create?',
	valuesMap: {
		CONSTRUCTION_RESOURCE: {
			description:
				'Resources used for build buildings. Can be a brick, wood, steel etc.',
		},
		ENERGY_RESOURCE: {
			description:
				'Resources used to power buildings and unlock technology. It can be a battery, coal, oil etc.',
		},
		TECHNOLOGY_ITEM_RESOURCE: {
			description:
				'Technology item that can be used for build buildings or in research nodes. Could be defined as circuit board, gear etc.',
		},
	},
});
