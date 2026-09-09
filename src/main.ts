import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { TransformInterceptor } from "./utils/transform.interceptor.js";
import { ValidationPipe } from "@nestjs/common";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // pipes happen before a controller
  app.useGlobalPipes(new ValidationPipe());
  // interceptors happen after a controller
  app.useGlobalInterceptors(new TransformInterceptor());
  // exception filter for Prisma errors
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
