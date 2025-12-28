import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',     // Frontend port
      'http://localhost:5000',     // Backend port for API testing
      'http://localhost:3001',     // Alternative frontend port
      'http://hr-tan.vercel.app'   // Production frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(5000);
  console.log('Application is running on: http://localhost:5000');
}
bootstrap();
