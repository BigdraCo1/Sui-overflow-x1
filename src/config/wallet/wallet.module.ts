import { Module } from '@nestjs/common';
import { Wallet } from './wallet.service';

@Module({
  providers: [Wallet],
  exports: [Wallet],
})
export class WalletModule {}