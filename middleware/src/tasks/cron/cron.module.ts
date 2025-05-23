import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { WalrusSealModule } from '../../common/walrus-seal/walrus-seal.module';
import { DatabaseModule } from '../../config/database/database.module';
import { WalletModule } from '@/config/wallet/wallet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WalrusSealModule,
    DatabaseModule,
    WalletModule
  ],
  providers: [CronService],
  exports: [CronService]
})
export class CronModule {}
