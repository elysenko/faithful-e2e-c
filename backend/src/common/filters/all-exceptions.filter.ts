import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/client';

const DB_UNAVAILABLE_MESSAGE =
  'The recipe service is temporarily unavailable. Please try again.';

// Prisma connection error codes: P1001 (can't reach DB), P1017 (connection closed).
const DB_CONNECTION_CODES = new Set(['P1001', 'P1002', 'P1017']);

/**
 * Global filter. Maps Prisma connection failures to HTTP 503 with a friendly
 * message; lets every other Nest HttpException pass through untouched and
 * falls back to 500 for anything unexpected.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: unknown = { statusCode: status, message: 'Server error' };

    if (this.isDatabaseUnavailable(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      body = { statusCode: status, message: DB_UNAVAILABLE_MESSAGE };
      this.logger.error(`Database unavailable: ${String((exception as Error)?.message)}`);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse();
    } else {
      this.logger.error(`Unhandled exception: ${String((exception as Error)?.stack ?? exception)}`);
    }

    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  private isDatabaseUnavailable(exception: unknown): boolean {
    if (exception instanceof PrismaClientInitializationError) return true;
    if (exception instanceof PrismaClientRustPanicError) return true;
    if (
      exception instanceof PrismaClientKnownRequestError &&
      DB_CONNECTION_CODES.has(exception.code)
    ) {
      return true;
    }
    return false;
  }
}
