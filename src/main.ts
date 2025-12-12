import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, isAbsolute } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { appConfig } from './config/app.config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors(appConfig.cors);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Apply global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Apply global pipes
  app.useGlobalPipes(new ValidationPipe());

  const uploadDestination = appConfig.uploads.destination;
  const absoluteUploadPath = isAbsolute(uploadDestination)
    ? uploadDestination
    : join(process.cwd(), uploadDestination);

  if (!existsSync(absoluteUploadPath)) {
    mkdirSync(absoluteUploadPath, { recursive: true });
  }

  app.useStaticAssets(absoluteUploadPath, {
    prefix: '/uploads/',
  });

  // Enable cookie parsing so req.cookies is available (used by JwtStrategy)
  app.use(cookieParser());

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Resource Management API')
    .setDescription('Authentication and resource management API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = appConfig.port;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Authentication Service running on port ${port}`);
  console.log(`🚀 API available at: http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});

