import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { WalrusSealModule } from '../../common/walrus-seal/walrus-seal.module';
import { DatabaseModule } from '../../config/database/database.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WalrusSealModule,
    DatabaseModule
  ],
  providers: [CronService],
  exports: [CronService]
})
export class CronModule {}
