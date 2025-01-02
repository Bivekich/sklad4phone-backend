import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  const TIMEOUT_MS = 600000;
  app.use((req, res, next) => {
    res.setTimeout(TIMEOUT_MS);
    next();
  });

  // Serve static files from the "uploads" directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Optional: URL prefix to access files, e.g., http://localshost:3000/uploads/<filename>
  });

  try {
    const port = process.env.PORT || 3000;
    const server = await app.listen(port);
    server.setTimeout(TIMEOUT_MS);
    logger.log('Application is running on: http://localhost:3000');
  } catch (error) {
    logger.error('Failed to start application', error);
  }
}

bootstrap();
