import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsEnum, IsString, Length} from 'class-validator';
import {Column, Entity, PrimaryColumn} from 'typeorm';

@ObjectType({
	description: 'Resource type, defines what kind of resources are in game',
})
@Entity({name: 'resource'})
export class ResourceModel {
	@PrimaryColumn({unique: true})
	@Field(() => ID)
	@IsString()
	id: string;

	@Field({description: 'What name that resource have'})
	@Length(2, 255)
	@Column('varchar')
	name: string;

	@Field(() => ResourceTypeEnum, {
		description: 'Type decides what kind of resource do we have here',
	})
	@IsEnum(ResourceTypeEnum)
	@Column('varchar')
	type: ResourceTypeEnum;
}
