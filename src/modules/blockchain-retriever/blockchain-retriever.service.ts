import { Injectable } from '@nestjs/common';
import { CreateBlockchainRetrieverDto } from './dto/create-blockchain-retriever.dto';
import { UpdateBlockchainRetrieverDto } from './dto/update-blockchain-retriever.dto';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { PACKAGE_ID } from '@/shared/constants';

@Injectable()
export class BlockchainRetrieverService {
  constructor(private readonly walrusSealService: WalrusSealService) {}
  create(createBlockchainRetrieverDto: CreateBlockchainRetrieverDto) {
    return 'This action adds a new blockchainRetriever';
  }

  findAll() {
    return `This action returns all blockchainRetriever`;
  }

  async retrieveAndDecrypt(blobId: string, allowlistId: string) {
    const txBytes = await this.walrusSealService.constructTxBytes("allowlist", [allowlistId]);
    return await this.walrusSealService.retrieveBlob(blobId, txBytes, [allowlistId]);
  }

  update(id: number, updateBlockchainRetrieverDto: UpdateBlockchainRetrieverDto) {
    return `This action updates a #${id} blockchainRetriever`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockchainRetriever`;
  }
}
