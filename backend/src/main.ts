import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { PlanService } from './plans/plans.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: ['192.168.88.10:3000'], // frontend URL
    credentials: true,
  });

  const config = app.get(ConfigService);

  // Get the PlanService from the app context
  const planService = app.get(PlanService);
  await planService.ensureDefaultPlans();

  await app.listen(config.get<string>('PORT')! || 4000);
}
bootstrap();
