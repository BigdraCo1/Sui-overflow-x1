import { Module } from '@nestjs/common';
import { BlockchainPusherModule } from './modules/blockchain-pusher/blockchain-pusher.module';
import { CronModule } from './tasks/cron/cron.module';
import { WalletModule } from './config/wallet/wallet.module';

@Module({
  imports: [
    WalletModule,
    BlockchainPusherModule,
    CronModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
