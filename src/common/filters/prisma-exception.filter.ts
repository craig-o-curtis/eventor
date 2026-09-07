import { Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { ArgumentsHost } from "@nestjs/common";
import { Response } from "express";

@Catch(Error)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const error = exception as Error & { code?: string };

    // Prisma 8 unique constraint violation (P2002 equivalent)
    if (error.code === "23505" || error.message?.includes("unique")) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "Email already exists",
        error: "Conflict",
      });
      return;
    }

    // Prisma 8 record not found (P2025 equivalent)
    if (error.code === "23503" || error.message?.includes("not found")) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        error: "Not Found",
      });
      return;
    }

    // Default error handling
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  }
}
