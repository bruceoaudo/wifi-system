import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MikrotikRouterService } from 'src/router/router.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private routerService: MikrotikRouterService,
  ) {}

  scheduleBlacklistJob(
    userId: string,
    mac: string,
    ip: string,
    durationInDays: number,
  ) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationInDays);

    const job = new CronJob(expirationDate, async () => {
      await this.routerService.blacklistUser(mac, ip);
      this.schedulerRegistry.deleteCronJob(`blacklist-${userId}`);
    });

    this.schedulerRegistry.addCronJob(`blacklist-${userId}`, job);
    job.start();
  }
}
