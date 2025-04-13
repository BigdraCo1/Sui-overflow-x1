import { Module } from '@nestjs/common';
import { BlockchainRetrieverService } from './blockchain-retriever.service';
import { BlockchainRetrieverController } from './blockchain-retriever.controller';
import { WalrusSealModule } from '@/common/walrus-seal/walrus-seal.module';

@Module({
  imports: [WalrusSealModule],
  controllers: [BlockchainRetrieverController],
  providers: [BlockchainRetrieverService],
})
export class BlockchainRetrieverModule {}
