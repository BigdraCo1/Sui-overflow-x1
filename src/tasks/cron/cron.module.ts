import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { WalletModule } from '@/config/wallet/wallet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WalletModule
  ],
  providers: [CronService],
  exports: [CronService]
})
export class CronModule {}
