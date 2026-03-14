import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ActivityModule } from './activity/activity.module';
import { AppActivityModule } from './app-activity/app-activity.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ActivityModule,
    AppActivityModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
