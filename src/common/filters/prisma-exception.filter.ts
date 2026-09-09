import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    // Anything Nest (or our own code) already threw as an HttpException knows
    // how to describe itself correctly — don't reinterpret it.
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const error = exception as Error & { code?: string };

    // Prisma 8 unique constraint violation (P2002 equivalent)
    if (error.code === UNIQUE_VIOLATION) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "Email already exists",
        error: "Conflict",
      });
      return;
    }

    // Prisma 8 record not found (P2025 equivalent)
    if (error.code === FOREIGN_KEY_VIOLATION) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        error: "Not Found",
      });
      return;
    }

    // Truly unexpected error — log it so it's not silently swallowed.
    this.logger.error(error?.message ?? "Unknown error", error?.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  }
}
