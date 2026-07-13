import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PrismaService');

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to the database');
    } catch (error) {
      // Do not crash the process on startup: the global exception filter and
      // /api/health/deep surface DB unavailability as 503 so k8s probes can act.
      this.logger.error(`Database connection failed on startup: ${error}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
