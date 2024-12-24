import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Serve static files from the "uploads" directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Optional: URL prefix to access files, e.g., http://localhost:3000/uploads/<filename>
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  try {
    await app.listen(3000);
    logger.log('Application is running on: http://localhost:3000');
  } catch (error) {
    logger.error('Failed to start application', error);
  }
}

bootstrap();
