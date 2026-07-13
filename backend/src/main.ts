import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerOptions, swaggerTitle, swaggerDescription } from './common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix is `/api` per ATLAS_STACK (override of the template default
  // `/api/v1`) so routes are /api/auth/*, /api/recipes, /api/health, etc.
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  app.use(helmet());
  // Single-container deployment serves the SPA and API from the same origin.
  // When FRONTEND_URL is set (e.g. local dev on :4200) use it, otherwise reflect
  // the request origin so the bundled SPA can call the API.
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ?? true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger Configuration --------------------------------
  // swaggerOptions, swaggerTitle, swaggerDescription variables are customized and defined in common/swagger/swagger.config.ts
  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Mounted at /docs to avoid colliding with the `/api` global prefix.
  SwaggerModule.setup('docs', app, document, swaggerOptions);

  // End Swagger Configurations --------------------------------

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port);
  Logger.log(`App running on Port ${port}`);
}
bootstrap();
