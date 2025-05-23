import { Injectable, Logger } from '@nestjs/common';
import { CreateBlockchainPusherDto } from './dto/create-blockchain-pusher.dto';
import { Wallet } from '@/config/wallet/wallet.service';
import { balance } from '@/common/helper';
import { DatabaseService } from '@/config/database/database.service';
import { Batch, Payload } from '@prisma/client';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { sleep } from '@/common/helper';
import { PACKAGE_ID } from '@/shared/constants';
import { decryptData } from '@/common/helper';

@Injectable()
export class BlockchainPusherService {
  private readonly logger = new Logger(BlockchainPusherService.name);
  constructor(private readonly wallet: Wallet, private readonly databaseService: DatabaseService, private readonly walrusSealService: WalrusSealService) { }

  async deployVault(createBlockchainPusherDto: CreateBlockchainPusherDto): Promise<Batch> {
    // First, process all device_ids and create/update Transportation records
    for (const item of createBlockchainPusherDto.batch) {
      const deviceId = item.metadata.device_id;

      // Try to find existing Transportation with this device_id
      const existingTransportation = await this.databaseService.transportation.findUnique({
        where: {
          device_id: deviceId,
        },
      });

      if (!existingTransportation) {
        // If not found, create a new Transportation record
        await this.databaseService.transportation.create({
          data: {
            device_id: deviceId,
            name: item.metadata.name,
            origin: item.metadata.origin,
            destination: item.metadata.destination
          }
        });
        this.logger.log(`Created new Transportation for device_id: ${deviceId}`);
      } else {
        this.logger.log(`Using existing Transportation for device_id: ${deviceId}`);
      }
    }

    // Then create the batch with nested payloads
    const batch = await this.databaseService.batch.create({
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
                data_hash: item.metadata.data_hash,
              }
            }
          }))
        }
      },
      include: {
        payloads: {
          include: {
            metadata: true
          }
        }
      }
    });

    // After creating the batch, link each metadata record to its corresponding Transportation
    for (const payload of batch.payloads) {
      if (payload.metadata) {
        const transportation = await this.databaseService.transportation.findUnique({
          where: {
            device_id: payload.metadata.device_id
          }
        });

        if (transportation) {
          // Link the metadata to the transportation
          await this.databaseService.metadata.update({
            where: {
              id: payload.metadata.id
            },
            data: {
              transportationId: transportation.id
            }
          });
          this.logger.log(`Linked metadata ID ${payload.metadata.id} to Transportation ID ${transportation.id}`);
        }
      }
    }

    return batch;
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
        allowlistId: allowlistId,
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
    this.logger.log(`Debugging encrypted data: ${payload.encrypted_data}`);
    const decryptedData = await decryptData(payload.encrypted_data);
    const parsedData = JSON.parse(decryptedData.toString());
    this.logger.log('Decrypted data:', parsedData);
    const encryptedData = await this.walrusSealService.encryptData(allowlist?.allowlistId, PACKAGE_ID, parsedData);
    this.logger.log('Encrypted data:', encryptedData);
    const blob = await this.walrusSealService.pushData(encryptedData.encryptedBytes, 3, true, this.wallet.getKeypair());
    await this.logger.log(`Pushed blob ID: ${blob.info.newlyCreated.blobObject.blobId}`);
    await this.databaseService.allowlist.update({
      where: {
        allowlistId: allowlist.allowlistId,
      },
      data: {
        blobId: blob.info.newlyCreated.blobObject.blobId,
      },
    });
    const tx = await this.walrusSealService.handlePublish(allowlist.allowlistId, allowlist.capId, "allowlist", blob.info.newlyCreated.blobObject.blobId);
    let result = await this.walrusSealService.signAndExecTxn(tx);
    sleep(2500);
    this.logger.log(`Transaction result: ${JSON.stringify(result)}`);
    await this.databaseService.payload.update({
      where: {
        id: payload.id,
      },
      data: {
        status: "PUBLISHED",
      },
    })
    const batch = await this.databaseService.batch.findFirst({
      where: {
        payloads: {
          some: {
            id: payload.id,
          }
        }
      },
      include: {
        payloads: true
      }
    });

    if (batch) {
      const allPublished = batch.payloads.every(payload => payload.status === "PUBLISHED");

      if (allPublished) {
        await this.databaseService.batch.update({
          where: {
            id: batch.id
          },
          data: {
            status: "PUBLISHED"
          }
        });
        this.logger.log(`Batch ${batch.id} status updated to PUBLISHED`);
      }
    }
  }

  async createAllow(allowlistId: string, address: string) {
    const allowlist = await this.databaseService.allowlist.findFirst({
      where: {
        allowlistId: allowlistId,
      },
      include: {
        payload: {
          include: {
            metadata: {
              include: {
                transportation: true,
              }
            }
          }
        }
      }
    });
    if (!allowlist) {
      throw new Error(`Allowlist not found for ID: ${allowlistId}`);
    }
    const tx = await this.walrusSealService.addAllowlistEntry(allowlist.allowlistId, allowlist.capId, "allowlist", address);
    let result = await this.walrusSealService.signAndExecTxn(tx);
    this.logger.log(`allowlistId: ${allowlist.allowlistId} == ${allowlistId}`);
    sleep(2500);
    this.logger.log(`Transaction result: ${JSON.stringify(result)}`);
    const account = await this.databaseService.account.findFirst({
      where: {
        address: address,
      },
      include: {
        transportationList: true,
      }
    });

    if (!account) {
      const transportation = allowlist.payload.metadata?.transportation;
      if (transportation) {
        await this.databaseService.account.create({
          data: {
            address: address,
            transportationList: {
              connect: [{ id: transportation.id }],
            },
          }
        });
      }
    } else {
      if (allowlist.payload.metadata?.transportation && !account.transportationList.includes(allowlist.payload.metadata.transportation)) {
        const updatedAllowlistIds = [...account.transportationList, allowlist.payload.metadata.transportation];
        await this.databaseService.account.update({
          where: {
            address: address,
          },
          data: {
            transportationList: {
              connect: updatedAllowlistIds.map(transportation => ({ id: transportation.id })),
            },
          }
        });
      }
    }
    const payloadsToUpdate = await this.databaseService.payload.findFirst({
      where: {
        allowlist: allowlist
      }
    });
    if (payloadsToUpdate) {
      await this.databaseService.payload.update({
        where: {
          id: payloadsToUpdate.id
        },
        data: {
          status: "SENT",
        },
      });
      const batch = await this.databaseService.batch.findFirst({
        where: {
          payloads: {
            some: {
              id: payloadsToUpdate.id,
            }
          }
        },
        include: {
          payloads: true
        }
      });
      if (batch) {
        const allSentOrPublished = batch.payloads.every(p =>
          p.status === "SENT"
        );
        if (allSentOrPublished) {
          await this.databaseService.batch.update({
            where: {
              id: batch.id
            },
            data: {
              status: "SENT"
            }
          });
          this.logger.log(`Batch ${batch.id} status updated to SENT`);
        }
      }
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} blockchainPusher`;
  }
}
