import {Field, Int, ObjectType} from '@nestjs/graphql';
import {IsNumber} from 'class-validator';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@ObjectType({
	description: 'Stealth capability: how hard it is to detect a unit',
})
@Entity({name: 'stealth-capability'})
export class StealthCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Int, {description: 'Stealth level of the unit'})
	@IsNumber()
	@Column('int')
	public level: number;
}
