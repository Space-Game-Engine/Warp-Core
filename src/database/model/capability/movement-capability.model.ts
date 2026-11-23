import {Field, Float, ObjectType} from '@nestjs/graphql';
import {IsNumber, IsString, Min, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

@ObjectType({
	description: 'Movement capability: how fast a unit moves on a movement layer',
})
@Entity({name: 'movement-capability'})
export class MovementCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => CapabilitiesModel, {
		description: 'Capabilities set that movement belongs to',
	})
	@ValidateNested()
	@ManyToOne(() => CapabilitiesModel, capabilities => capabilities.movement, {
		lazy: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	public capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	@Field(() => String, {
		description:
			'Movement layer, where unit is able to move (land, water, air, space...)',
	})
	@IsString()
	@Column('varchar')
	public layer: string;

	@Field(() => Float, {description: 'Speed of the unit on that layer'})
	@IsNumber()
	@Min(0)
	@Column({type: 'float', precision: 10, scale: 4})
	public speed: number;
}
