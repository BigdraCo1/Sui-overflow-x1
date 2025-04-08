import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainPusherService } from './blockchain-pusher.service';
import { Wallet } from '@/config/wallet/wallet.service';

describe('BlockchainPusherService', () => {
  let service: BlockchainPusherService;

  const mockWallet = {
    publicKey: '0xmockaddress',
    suiClient: {
      getBalance: jest.fn().mockResolvedValue({
        totalBalance: '1000000000'
      })
    },
    getKeypair: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainPusherService,
        {
          provide: Wallet,
          useValue: mockWallet
        }
      ],
    }).compile();

    service = module.get<BlockchainPusherService>(BlockchainPusherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
