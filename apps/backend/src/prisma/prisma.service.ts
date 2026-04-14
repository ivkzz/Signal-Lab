import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

type ScenarioRunRecord = {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  metadata: unknown;
  createdAt: Date;
};

type ScenarioRunDelegate = {
  findMany(args: {
    take: number;
    orderBy: { createdAt: 'asc' | 'desc' };
  }): Promise<ScenarioRunRecord[]>;
  create(args: {
    data: {
      type: string;
      status: string;
      duration?: number;
      error?: string;
      metadata?: unknown;
    };
  }): Promise<ScenarioRunRecord>;
};

type PrismaClientCtor = new (args?: unknown) => {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  scenarioRun: ScenarioRunDelegate;
};

// Runtime-safe import for environments where generated prisma typings are not available at compile time.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client') as {
  PrismaClient: PrismaClientCtor;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  declare scenarioRun: ScenarioRunDelegate;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
