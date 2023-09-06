import {Field, ID, InputType, Int} from '@nestjs/graphql';
import {IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';

@InputType({description: 'Creates new element in queue'})
export class AddToQueueInput {
	@IsNumber({}, {message: 'Building zone id must be a number'})
	@IsPositive({message: 'Building zone id must be a positive number'})
	@Field(() => Int, {description: 'Local Id of building zone'})
	localBuildingZoneId: number;

	@IsOptional()
	@IsString()
	@Field(() => ID, {
		description:
			'Id of building type that will be constructed. If building is already placed, that field will be ignored',
		nullable: true,
	})
	buildingId?: string | null;

	@IsNumber()
	@IsPositive()
	@Field(() => Int, {description: 'How much levels will be build'})
	endLevel: number;
}
