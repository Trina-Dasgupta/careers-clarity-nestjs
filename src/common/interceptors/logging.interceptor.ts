import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const now = Date.now();

    // Log sensitive data masking
    const logBody = { ...body };
    if (logBody.password) logBody.password = '***';
    if (logBody.newPassword) logBody.newPassword = '***';
    if (logBody.currentPassword) logBody.currentPassword = '***';

    this.logger.log(`[${method}] ${url} - Body: ${JSON.stringify(logBody)}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `[${method}] ${url} - Completed in ${duration}ms`,
        );
      }),
    );
  }
}
