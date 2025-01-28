import {Field, InputType, Int} from '@nestjs/graphql';

@InputType({description: 'Creates new habitat'})
export class NewHabitatInput {
	@Field(() => Int, {description: 'User id'})
	public userId: number;

	@Field({nullable: true, description: 'Is that main habitat?'})
	public isMain?: boolean;

	@Field({description: 'Name of the habitat'})
	public name: string = 'default name';
}
