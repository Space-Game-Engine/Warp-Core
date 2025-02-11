import {ApiProperty} from '@nestjs/swagger';

export class LoginParameters {
	@ApiProperty({
		type: Number,
		description: 'Id of user that wants to log in',
	})
	public readonly userId: number;

	@ApiProperty({
		type: Number,
		description: 'Id of habitat that should be shown',
	})
	public readonly habitatId: number;
}
