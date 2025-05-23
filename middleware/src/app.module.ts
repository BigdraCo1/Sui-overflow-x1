import { Module } from '@nestjs/common';
import { BlockchainPusherModule, BlockchainRetrieverModule } from './modules';
import { CronModule } from './tasks/cron/cron.module';
import { WalletModule } from './config/wallet/wallet.module';

@Module({
  imports: [
    WalletModule,
    BlockchainPusherModule,
    CronModule,
    BlockchainRetrieverModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
