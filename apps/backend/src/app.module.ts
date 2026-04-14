import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ScenarioModule } from './scenarios/scenario.module';
import { ObservabilityModule } from './observability/observability.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Monorepo: `npm run start:dev` из apps/backend — подхватываем корневой `.env` рядом с docker-compose.
      envFilePath: [join(process.cwd(), '../../.env'), join(process.cwd(), '.env')],
    }),
    PrometheusModule.register({
      path: '/metrics',
    }),
    PrismaModule,
    ObservabilityModule,
    ScenarioModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, GlobalExceptionFilter],
})
export class AppModule {}
