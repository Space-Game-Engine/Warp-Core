import {Field, Float, ObjectType} from '@nestjs/graphql';
import {IsNumber, Min} from 'class-validator';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@ObjectType({description: 'Defense capability: how well a unit resists damage'})
@Entity({name: 'defense-capability'})
export class DefenseCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Float, {description: 'Armor of the unit'})
	@IsNumber()
	@Min(0)
	@Column({type: 'float', precision: 10, scale: 4})
	public armor: number;
}
