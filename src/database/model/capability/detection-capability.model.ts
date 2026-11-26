import {Field, Float, ObjectType} from '@nestjs/graphql';
import {IsBoolean, IsNumber} from 'class-validator';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@ObjectType({description: 'Detection capability: what a unit is able to see'})
@Entity({name: 'detection-capability'})
export class DetectionCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Float, {description: 'Range of sight'})
	@IsNumber()
	@Column({type: 'float', precision: 10, scale: 4})
	public sightRange: number;

	@Field({description: 'Is the unit able to detect stealth units?'})
	@IsBoolean()
	@Column('boolean')
	public detectsStealth: boolean;
}
