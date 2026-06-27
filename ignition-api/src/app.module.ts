import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { LoggerModule } from './common/logging/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppThrottlerModule } from './throttler/throttler.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SessionModule } from './session/session.module';
import { AddressesModule } from './addresses/addresses.module';
import { ConfigValidationService } from './config/validation';
import { SentryMiddleware } from './common/sentry/sentry.middleware';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    PrismaModule,
    QueueModule,
    RedisModule,
    HealthModule,
    SessionModule,
    AuthModule,
    AppThrottlerModule,
    ApiKeysModule,
    CampaignsModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    AddressesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigValidationService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SentryMiddleware).forRoutes('*');
  }
}
