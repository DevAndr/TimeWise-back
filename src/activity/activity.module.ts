import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { GoalModule } from '../goal/goal.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [GoalModule, NotificationModule],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
