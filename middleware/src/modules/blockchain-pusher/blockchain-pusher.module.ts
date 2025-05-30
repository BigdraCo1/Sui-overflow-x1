// filepath: /Users/bellian/sui-hacker-house/middleware-2-onchain/src/modules/blockchain-pusher/blockchain-pusher.module.ts
import { Module } from '@nestjs/common';
import { BlockchainPusherService } from './blockchain-pusher.service';
import { BlockchainPusherController } from './blockchain-pusher.controller';
import { WalletModule } from '@/config/wallet/wallet.module';
import { DatabaseModule } from '@/config/database/database.module';
import { WalrusSealModule } from '@/common/walrus-seal/walrus-seal.module';

@Module({
  imports: [WalletModule, DatabaseModule, WalrusSealModule],
  controllers: [BlockchainPusherController],
  providers: [BlockchainPusherService],
})
export class BlockchainPusherModule {}