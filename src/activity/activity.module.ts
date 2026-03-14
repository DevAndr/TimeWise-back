import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { GoalModule } from '../goal/goal.module';

@Module({
  imports: [GoalModule],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
