import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainRetrieverController } from './blockchain-retriever.controller';
import { BlockchainRetrieverService } from './blockchain-retriever.service';

describe('BlockchainRetrieverController', () => {
  let controller: BlockchainRetrieverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainRetrieverController],
      providers: [BlockchainRetrieverService],
    }).compile();

    controller = module.get<BlockchainRetrieverController>(BlockchainRetrieverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
