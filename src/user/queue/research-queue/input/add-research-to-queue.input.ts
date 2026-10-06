import {Field, ID, InputType, Int} from '@nestjs/graphql';
import {IsNumber, IsPositive, IsString} from 'class-validator';

@InputType({description: 'Creates new element in research queue'})
export class AddResearchToQueueInput {
	@IsString()
	@Field(() => ID, {
		description: 'Id of research node that will be developed',
	})
	public researchNodeId: string;

	@IsNumber()
	@IsPositive()
	@Field(() => Int, {description: 'How much levels will be developed'})
	public endLevel: number;
}
