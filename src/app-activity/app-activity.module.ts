import { Module } from '@nestjs/common';
import { AppActivityController } from './app-activity.controller';
import { AppActivityService } from './app-activity.service';

@Module({
  controllers: [AppActivityController],
  providers: [AppActivityService],
})
export class AppActivityModule {}
