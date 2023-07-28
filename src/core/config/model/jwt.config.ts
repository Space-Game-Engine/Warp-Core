import {IsBoolean, IsInt, IsString, Min} from 'class-validator';

export class JwtConfig {
	@IsString()
	secret: string;

	@IsInt()
	@Min(1)
	expiresIn: number;

	@IsBoolean()
	ignoreExpiration: boolean;
}
