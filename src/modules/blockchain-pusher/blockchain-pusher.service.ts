import { Injectable } from '@nestjs/common';
import { CreateBlockchainPusherDto } from './dto/create-blockchain-pusher.dto';
import { Wallet } from '@/config/wallet/wallet.service';
import { balance } from '@/common/helper';
import { DatabaseService } from '@/config/database/database.service';
import { Batch } from '@prisma/client';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';

@Injectable()
export class BlockchainPusherService {
  constructor(private readonly wallet: Wallet, private readonly databaseService: DatabaseService, private readonly walrusSealService: WalrusSealService) {}

  async deployVault(createBlockchainPusherDto: CreateBlockchainPusherDto): Promise<Batch> {
    // Create the batch with nested payloads
    return this.databaseService.batch.create({
      data: {
        // Create all payloads in the batch
        payloads: {
          create: createBlockchainPusherDto.batch.map(item => ({
            encrypted_data: item.encrypted_data,
            // Create the metadata for each payload
            metadata: {
              create: {
                device_id: item.metadata.device_id,
                timestamp: new Date(item.metadata.timestamp * 1000), // Convert Unix timestamp to Date
                data_hash: item.metadata.data_hash
              }
            }
          }))
        }
      },
      // Include the created payloads in the response
      include: {
        payloads: {
          include: {
            metadata: true
          }
        }
      }
    });
  }

  async balance() {
    const sui = await this.wallet.suiClient.getBalance({
      owner: this.wallet.publicKey,
    });
    return balance(sui);
  }

  findOne(id: number) {
    return `This action returns a #${id} blockchainPusher`;
  }

  // update(id: number, updateBlockchainPusherDto: UpdateBlockchainPusherDto) {
  //   return `This action updates a #${id} blockchainPusher`;
  // }

  remove(id: number) {
    return `This action removes a #${id} blockchainPusher`;
  }
}
