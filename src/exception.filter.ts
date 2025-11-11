import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	Logger,
	HttpStatus,
} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);
	public catch(exception: Error, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = HttpStatus.INTERNAL_SERVER_ERROR;

		this.logger.error(exception);

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
