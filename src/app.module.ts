import { Module } from '@nestjs/common';
import { BlockchainPusherModule } from './modules/blockchain-pusher/blockchain-pusher.module';
import { CronModule } from './tasks/cron/cron.module';

@Module({
  imports: [
    BlockchainPusherModule,
    CronModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
