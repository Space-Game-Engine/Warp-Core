import {registerEnumType} from '@nestjs/graphql';

export enum CapabilityTargetTypeEnum {
	UNIT = 'unit',
	TAG = 'tag',
	MOVEMENT_LAYER = 'movement_layer',
}

registerEnumType(CapabilityTargetTypeEnum, {
	name: 'Capability_target_type',
	description: 'What kind of thing is targeted by a capability?',
	valuesMap: {
		UNIT: {
			description: 'Precise unit blueprint, value is the id of the unit',
		},
		TAG: {
			description: 'All units with that tag, value is the tag name',
		},
		MOVEMENT_LAYER: {
			description:
				'All units that move on that layer, value is the id of the layer',
		},
	},
});
