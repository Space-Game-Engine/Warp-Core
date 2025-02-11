import {ApiProperty} from '@nestjs/swagger';

export class AccessToken {
	@ApiProperty({
		type: 'string',
		description:
			'Holds access token that allows to log in into application later',
		example: 'Bearer JWT_TOKEN',
	})
	public readonly access_token: string;
}
