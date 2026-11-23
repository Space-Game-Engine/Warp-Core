import {Field, ID, InputType, Int} from '@nestjs/graphql';
import {IsInt, IsPositive, IsString} from 'class-validator';

@InputType({description: 'Creates new element in unit queue'})
export class AddUnitToQueueInput {
	@IsString()
	@Field(() => ID, {
		description: 'Id of unit blueprint that will be built',
	})
	public unitId: string;

	@IsInt({message: 'Amount of units has to be an integer number.'})
	@IsPositive({message: 'Amount of units has to be higher than zero.'})
	@Field(() => Int, {description: 'How many units will be built'})
	public amount: number;
}
