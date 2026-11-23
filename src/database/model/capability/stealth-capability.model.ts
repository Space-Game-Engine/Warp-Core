import {Field, Int, ObjectType} from '@nestjs/graphql';
import {IsNumber, Min} from 'class-validator';
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
	@Min(0)
	@Column('int')
	public level: number;
}
