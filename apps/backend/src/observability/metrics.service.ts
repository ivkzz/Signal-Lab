import { Injectable } from '@nestjs/common';
import { Counter, Histogram, type Registry, register } from 'prom-client';

type ScenarioLabels = 'type' | 'status';
type DurationLabels = 'type';
type HttpLabels = 'method' | 'path' | 'status_code';

@Injectable()
export class MetricsService {
  private readonly scenarioRunsTotal: Counter<ScenarioLabels>;
  private readonly scenarioRunDurationSeconds: Histogram<DurationLabels>;
  private readonly httpRequestsTotal: Counter<HttpLabels>;

  constructor() {
    this.scenarioRunsTotal = this.getOrCreateCounter<ScenarioLabels>(
      register,
      'scenario_runs_total',
      'Total number of scenario runs',
      ['type', 'status'],
    );
    this.scenarioRunDurationSeconds = this.getOrCreateHistogram<DurationLabels>(
      register,
      'scenario_run_duration_seconds',
      'Scenario run duration in seconds',
      ['type'],
      [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 8],
    );
    this.httpRequestsTotal = this.getOrCreateCounter<HttpLabels>(
      register,
      'http_requests_total',
      'Total HTTP requests',
      ['method', 'path', 'status_code'],
    );
  }

  recordScenarioRun(
    type: string,
    status: string,
    durationSeconds: number,
  ): void {
    this.scenarioRunsTotal.labels(type, status).inc();
    this.scenarioRunDurationSeconds.labels(type).observe(durationSeconds);
  }

  recordHttpRequest(method: string, path: string, statusCode: number): void {
    this.httpRequestsTotal
      .labels(method.toUpperCase(), path, String(statusCode))
      .inc();
  }

  private getOrCreateCounter<T extends string>(
    registry: Registry,
    name: string,
    help: string,
    labelNames: T[],
  ): Counter<T> {
    const existing = registry.getSingleMetric(name);
    if (existing) {
      return existing as Counter<T>;
    }

    return new Counter<T>({
      name,
      help,
      labelNames,
      registers: [registry],
    });
  }

  private getOrCreateHistogram<T extends string>(
    registry: Registry,
    name: string,
    help: string,
    labelNames: T[],
    buckets: number[],
  ): Histogram<T> {
    const existing = registry.getSingleMetric(name);
    if (existing) {
      return existing as Histogram<T>;
    }

    return new Histogram<T>({
      name,
      help,
      labelNames,
      buckets,
      registers: [registry],
    });
  }
}
