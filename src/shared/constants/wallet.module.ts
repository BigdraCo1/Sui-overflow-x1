import { Module } from '@nestjs/common';
import { Wallet } from './wallet.constants';

@Module({
  providers: [Wallet],
  exports: [Wallet],
})
export class WalletModule {}