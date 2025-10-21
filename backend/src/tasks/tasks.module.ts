import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MikrotikRouterModule } from 'src/router/router.module';

@Module({
  imports: [ScheduleModule.forRoot(), MikrotikRouterModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
