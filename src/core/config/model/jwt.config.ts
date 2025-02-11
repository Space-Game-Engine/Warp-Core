import {IsBoolean, IsInt, IsString, Min} from 'class-validator';

export class JwtConfig {
	@IsString()
	public secret: string;

	@IsInt()
	@Min(1)
	public expiresIn: number;

	@IsBoolean()
	public ignoreExpiration: boolean;
}
