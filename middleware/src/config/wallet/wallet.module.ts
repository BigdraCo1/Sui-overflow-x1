import { Global, Module } from '@nestjs/common';
import { Wallet } from './wallet.service';

@Global()
@Module({
  providers: [Wallet],
  exports: [Wallet],
})
export class WalletModule {}