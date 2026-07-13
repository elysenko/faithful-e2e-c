import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Public } from 'src/auth/decorators';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService
  ) {}

  // GET /api/health — liveness. Cheap, no DB dependency (used by k8s probes).
  @Get()
  @Public()
  liveness() {
    return { status: 'ok' };
  }

  // GET /api/health/deep — readiness. Verifies the database with SELECT 1,
  // responds 503 when the DB is unreachable.
  @Get('deep')
  @Public()
  async deep() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
        message: 'The recipe service is temporarily unavailable. Please try again.',
      });
    }
  }

  // Kept for backwards compatibility with the template health routes.
  @Get('live')
  @Public()
  legacyLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
