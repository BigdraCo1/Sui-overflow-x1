import { Injectable } from '@nestjs/common';
import { CreateBlockchainRetrieverDto } from './dto/create-blockchain-retriever.dto';
import { UpdateBlockchainRetrieverDto } from './dto/update-blockchain-retriever.dto';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { PACKAGE_ID } from '@/shared/constants';
import { DatabaseService } from '@/config/database/database.service';
import { readBlob } from '@/common/helper';

@Injectable()
export class BlockchainRetrieverService {
  constructor(private readonly walrusSealService: WalrusSealService, private readonly databaseService: DatabaseService) { }
  create(createBlockchainRetrieverDto: CreateBlockchainRetrieverDto) {
    return 'This action adds a new blockchainRetriever';
  }

  findAll() {
    return `This action returns all blockchainRetriever`;
  }

  async retrieveAndDecrypt(blobId: string//, allowlistId: string
  ) {
    //const txBytes = await this.walrusSealService.constructTxBytes("allowlist", [allowlistId]);
    return await this.walrusSealService.retrieveBlob(blobId//, txBytes, [allowlistId]
    );
  }

  async bundleBlob(transportationId: string) {
    const transportation = await this.databaseService.transportation.findFirst({
      where: {
        id: transportationId,
      },
      include: {
        metadataList: {
          include: {
            payload: {
              include: {
                allowlist: true
              }
            }
          },
        },
      },
    });

    // Check if transportation exists
    if (!transportation) {
      throw new Error(`Transportation with ID ${transportationId} not found`);
    }

    // Map through the metadata list to get all blob IDs
    const blobIds = transportation.metadataList
      .filter(metadata => metadata.payload?.allowlist?.blobId) // Filter out entries without blobId
      .map(metadata => metadata.payload?.allowlist?.blobId)
      .filter((blobId): blobId is string => blobId !== null && blobId !== undefined); // Type guard to ensure only strings

    return await this.walrusSealService.retrieveBlobs(blobIds);
    //return blobIds;
  }

  async debugReadblob(blobId: string) {
    const data = await readBlob(blobId);
    console.log("data", data);
    return data;
  }

  async retriveAccountTrasportation(address: string) {
    const account = await this.databaseService.account.findFirst({
      where: {
        address: address,
      },
      include: {
        transportationList: {
          include: {
            metadataList: {
              include: {
                payload: {
                  include: {
                    allowlist: true
                  }
                },
              },
            }
          }
        }
      }
    });
    return await account?.transportationList;
  }

  async retriveTransportation(transportationId: string) {
    const transportation = await this.databaseService.transportation.findFirst({
      where: {
        id: transportationId,
      },
    });
    return await transportation;
  }

  update(id: number, updateBlockchainRetrieverDto: UpdateBlockchainRetrieverDto) {
    return `This action updates a #${id} blockchainRetriever`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockchainRetriever`;
  }
}
