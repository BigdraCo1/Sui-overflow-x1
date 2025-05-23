import { Module } from '@nestjs/common';
import { WalrusSealService } from './walrus-seal.service';

@Module({
  providers: [WalrusSealService],
  exports: [WalrusSealService],
})
export class WalrusSealModule {}