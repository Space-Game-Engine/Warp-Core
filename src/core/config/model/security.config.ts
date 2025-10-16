import {IsOptional, IsString} from 'class-validator';

export class SecurityConfig {
	@IsString()
	@IsOptional()
	public headerTokenToLogin?: string;

	@IsString()
	@IsOptional()
	public whitelistedIp?: string;
}
