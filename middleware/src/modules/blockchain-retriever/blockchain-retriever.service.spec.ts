import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainRetrieverService } from './blockchain-retriever.service';

describe('BlockchainRetrieverService', () => {
  let service: BlockchainRetrieverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainRetrieverService],
    }).compile();

    service = module.get<BlockchainRetrieverService>(BlockchainRetrieverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
