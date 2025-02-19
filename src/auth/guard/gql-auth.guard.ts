import {ExecutionContext, Injectable} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';

import {JwtAuthGuard} from './jwt-auth.guard';

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {
	public getRequest(context: ExecutionContext): Request {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}
}
