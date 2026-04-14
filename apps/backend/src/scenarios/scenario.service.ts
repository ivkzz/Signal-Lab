import * as Sentry from '@sentry/nestjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../observability/metrics.service';
import type { ScenarioType } from './scenario.types';

type ScenarioRunRecord = {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  metadata: unknown;
  createdAt: Date;
};

@Injectable()
export class ScenarioService {
  private readonly logger = new Logger(ScenarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  findAll(): Promise<ScenarioRunRecord[]> {
    return this.prisma.scenarioRun.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async run(type: ScenarioType, name?: string) {
    const startTime = Date.now();
    const metadata: Record<string, unknown> = name ? { name } : {};

    try {
      this.logScenario('info', 'Scenario execution started', {
        scenarioType: type,
      });

      switch (type) {
        case 'success':
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 150 + 50),
          );
          break;

        case 'validation_error':
          throw new BadRequestException(
            'Validation failed: invalid scenario params',
          );

        case 'system_error':
          throw new Error('Unexpected system failure');

        case 'slow_request':
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 3000 + 2000),
          );
          break;

        case 'teapot':
          break;
      }

      if (type === 'teapot') {
        const durationMs = Date.now() - startTime;
        const teapotRun = await this.prisma.scenarioRun.create({
          data: {
            type,
            status: 'teapot',
            duration: durationMs,
            metadata: { ...(metadata as object), easter: true },
          },
        });
        this.metricsService.recordScenarioRun(
          type,
          'teapot',
          durationMs / 1000,
        );
        this.logScenario('warn', 'Teapot scenario triggered', {
          scenarioType: type,
          scenarioId: teapotRun.id,
          duration: durationMs,
          error: null,
        });

        throw new HttpException(
          { signal: 42, message: "I'm a teapot" },
          HttpStatus.I_AM_A_TEAPOT,
        );
      }

      const durationMs = Date.now() - startTime;
      const run = await this.prisma.scenarioRun.create({
        data: {
          type,
          status: 'completed',
          duration: durationMs,
          metadata,
        },
      });
      this.metricsService.recordScenarioRun(
        type,
        'completed',
        durationMs / 1000,
      );
      this.logScenario('info', 'Scenario execution completed', {
        scenarioType: type,
        scenarioId: run.id,
        duration: durationMs,
        error: null,
      });
      return run;
    } catch (e) {
      const durationMs = Date.now() - startTime;
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';

      if (e instanceof HttpException && e.getStatus() === 418) {
        throw e;
      }

      if (e instanceof BadRequestException) {
        Sentry.addBreadcrumb({
          category: 'scenario.validation',
          level: 'warning',
          message: `Validation error for scenario type: ${type}`,
        });
      } else {
        Sentry.captureException(e);
      }

      const failedRun = await this.prisma.scenarioRun.create({
        data: {
          type,
          status: 'error',
          duration: durationMs,
          error: errorMessage,
          metadata,
        },
      });

      this.metricsService.recordScenarioRun(type, 'error', durationMs / 1000);
      this.logScenario('error', 'Scenario execution failed', {
        scenarioType: type,
        scenarioId: failedRun.id,
        duration: durationMs,
        error: errorMessage,
      });

      if (e instanceof BadRequestException || e instanceof HttpException) {
        throw e;
      }

      throw new InternalServerErrorException('Scenario execution failed');
    }
  }

  private logScenario(
    level: 'info' | 'warn' | 'error',
    message: string,
    details: {
      scenarioType: string;
      scenarioId?: string;
      duration?: number;
      error?: string | null;
    },
  ): void {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      context: ScenarioService.name,
      ...details,
    });

    if (level === 'error') {
      this.logger.error(payload);
      return;
    }
    if (level === 'warn') {
      this.logger.warn(payload);
      return;
    }

    this.logger.log(payload);
  }
}
