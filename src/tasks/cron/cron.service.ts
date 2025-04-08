import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Wallet } from '@/config/wallet/wallet.service';
import { CronJob } from 'cron';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly wallet: Wallet,
  ) {}
  
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourly() {
    this.logger.log('Running hourly task');
  }

  // Manually create and register a cron job
  createCustomJob(name: string, cronTime: string, callback: () => void) {
    // Correctly instantiate a CronJob
    const job = new CronJob(cronTime, callback);
    
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    
    this.logger.log(`Job ${name} created with schedule: ${cronTime}`);
    return job;
  }

  // Delete a manually created job
  deleteCustomJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.log(`Job ${name} deleted`);
  }

  // List all registered cron jobs
  getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is undefined';
      }
      this.logger.log(`Job: ${key} -> Next: ${next}`);
    });
    return jobs;
  }
}
