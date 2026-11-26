import {Field, ObjectType} from '@nestjs/graphql';
import {IsEnum, IsString, Length} from 'class-validator';
import {Column} from 'typeorm';

import {CapabilityTargetTypeEnum} from '@warp-core/database/enum/capability-target-type.enum';

/**
 * Base for capabilities that work on a single target (attack, healing).
 * Aggregators group such capabilities by `targetType` and `targetValue`.
 */
@ObjectType({
	isAbstract: true,
	description: 'Capability that is aimed at a single target',
})
export abstract class AbstractTargetedCapabilityModel {
	@Field(() => CapabilityTargetTypeEnum, {
		description: 'Says how to read the target value',
	})
	@IsEnum(CapabilityTargetTypeEnum)
	@Column('varchar')
	public targetType: CapabilityTargetTypeEnum;

	@Field({
		description:
			'Unit id, tag name or movement layer id, based on the target type',
	})
	@IsString()
	@Length(1, 255)
	@Column('varchar')
	public targetValue: string;
}
