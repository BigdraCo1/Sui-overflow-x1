import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainPusherController } from './blockchain-pusher.controller';
import { BlockchainPusherService } from './blockchain-pusher.service';
import { Wallet } from '@/shared/constants/wallet.constants';

describe('BlockchainPusherController', () => {
  let controller: BlockchainPusherController;

  // Mock service with required methods
  const mockBlockchainPusherService = {
    create: jest.fn(),
    balance: jest.fn().mockResolvedValue(1.0),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  // Mock wallet
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
      controllers: [BlockchainPusherController],
      providers: [
        {
          provide: BlockchainPusherService,
          useValue: mockBlockchainPusherService
        },
        {
          provide: Wallet,
          useValue: mockWallet
        }
      ],
    }).compile();

    controller = module.get<BlockchainPusherController>(BlockchainPusherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
