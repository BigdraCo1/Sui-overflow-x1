import { Injectable, Logger } from '@nestjs/common';
import { CreateBlockchainPusherDto } from './dto/create-blockchain-pusher.dto';
import { Wallet } from '@/config/wallet/wallet.service';
import { balance } from '@/common/helper';
import { DatabaseService } from '@/config/database/database.service';
import { Batch, Payload } from '@prisma/client';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { sleep } from '@/common/helper';
import { PACKAGE_ID } from '@/shared/constants';

@Injectable()
export class BlockchainPusherService {
  private readonly logger = new Logger(BlockchainPusherService.name);
  constructor(private readonly wallet: Wallet, private readonly databaseService: DatabaseService, private readonly walrusSealService: WalrusSealService) { }

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

  async pushBatch(allowlistId: string) {
    const allowlist = await this.databaseService.allowlist.findFirst({
      where: {
        id: allowlistId,
      }
    });
    const payload = await this.databaseService.payload.findFirst({
      where: {
        allowlist: allowlist,
      },
      include: {
        metadata: true,
      },
    });
    if (!payload) {
      throw new Error(`Payload not found for allowlist ID: ${allowlistId}`);
    }
    if (!allowlist?.allowlistId) {
      throw new Error(`Allowlist ID not found for payload ID: ${payload.id}`);
    }
    const encryptedData = await this.walrusSealService.encryptData(allowlist?.allowlistId, PACKAGE_ID, payload);
    const blob = await this.walrusSealService.pushData(encryptedData.encryptedBytes, 3, true, this.wallet.getKeypair()); 
    await this.logger.log(`Pushed blob ID: ${blob.blobId}`);
    await this.databaseService.allowlist.update({
      where: {
        id: allowlist.id,
      },
      data: {
        blobId: blob.blobId,
      },
    });
    const tx = await this.walrusSealService.handlePublish(allowlist.allowlistId, allowlist.capId, "allowlist", blob.blobId);
    let result = await this.walrusSealService.signAndExecTxn(tx);
    sleep(2500);
    this.logger.log(`Transaction result: ${JSON.stringify(result)}`);
  }

  async createAllow() {
    const errorPayloads: Payload[] = [];
    const batches = await this.databaseService.batch.findMany({
      where: {
        status: 'WAITING_FOR_ALLOWLIST',
      },
      include: {
        payloads: {
          include: {
            metadata: true,
          },
        },
      },
    });
    const module_name = "allowlist";
    for (const batch of batches) {
      for (const payload of batch.payloads) {
        const allowlistEntry = await this.databaseService.allowlist.findFirst({
          where: {
            payloadId: payload.id,
          },
        });
        try {
          if (!payload.metadata) {
            console.error(`Payload metadata is missing for batch ID: ${batch.id}`);
            continue;
          }
          if (!allowlistEntry) {
            console.error(`Allowlist entry not found for payload ID: ${payload.id}`);
            continue;
          }
          console.log("allowlistid", allowlistEntry.allowlistId);
          console.log("capid", allowlistEntry.capId);
          const txa = await this.walrusSealService.addAllowlistEntry(allowlistEntry.allowlistId, allowlistEntry.capId, module_name, this.wallet.publicKey);
          await this.walrusSealService.signAndExecTxn(txa);
          sleep(1000);
        } catch (error) {
          console.error(`Error processing payload: ${error}`);
          errorPayloads.push(payload);
        }
      }
      while (errorPayloads.length > 0) {
        await this.logger.log(errorPayloads);
        for (const payload of errorPayloads) {
          try {
            const allowlistEntry = await this.databaseService.allowlist.findFirst({
              where: {
                payloadId: payload.id,
              },
            });
            if (!allowlistEntry) {
              console.error(`Allowlist entry not found for payload ID: ${payload.id}`);
              continue;
            }
            await this.logger.log(`Retrying payload ID: ${payload.id}`);
            const txb = await this.walrusSealService.addAllowlistEntry(allowlistEntry.allowlistId, allowlistEntry.capId, module_name, this.wallet.publicKey);
            await this.walrusSealService.signAndExecTxn(txb);
            await sleep(2500);
            errorPayloads.splice(errorPayloads.indexOf(payload), 1);
          } catch (error) {
            console.error(`Error processing payload: ${error}`);
          }
        }
      }
      if (!errorPayloads.length) {
        await this.databaseService.batch.update({
          where: { id: batch.id },
          data: {
            status: 'SENT',
            pushedAt: new Date(),
          },
          include: {
            payloads: {
              include: {
                metadata: true,
              },
            },
          },
        });
      }
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} blockchainPusher`;
  }
}
