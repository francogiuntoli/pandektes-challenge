import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { CASE_FILE_SIZE_LIMIT } from './cases/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  app.use(json());

  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFiles: 1,
      maxFileSize: CASE_FILE_SIZE_LIMIT,
    }),
  );

  class AppValidationPipe extends ValidationPipe {
    protected toValidate(metadata: ArgumentMetadata): boolean {
      if (metadata.metatype === Promise) {
        return false;
      }
      return super.toValidate(metadata);
    }
  }

  app.useGlobalPipes(
    new AppValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pandektes API')
    .setDescription('Interactive documentation for the case ingestion service.')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Include the JWT access token prefixed with `Bearer`.',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
