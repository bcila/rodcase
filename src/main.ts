import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware to parse cookies
  app.use(cookieParser());

  // Check upload directory, create if it doesn't exist
  const uploadDir = process.env.UPLOAD_DIR ?? '/uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Media API')
    .setDescription('NestJS Media Library API')
    .setVersion('1.0')
    .addBearerAuth() // For JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    jsonDocumentUrl: '/api/swagger.json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
