import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DatabaseService } from '@/config/database/database.service';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { TransactionStatus as PrismaTransactionStatus } from '@prisma/client';
import { Wallet } from '@/config/wallet/wallet.service';
import { sleep } from '@/common/helper';
import { PACKAGE_ID } from '@/shared/constants';
import { Transaction } from '@mysten/sui/transactions';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly databaseService: DatabaseService,
    private readonly walrusSealService: WalrusSealService,
    private readonly wallet: Wallet,
  ) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleHourly() {
    await this.logger.log('----PUSHING WALRUS SEAL----');
    const batches = await this.databaseService.batch.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        payloads: {
          include: {
            metadata: true,
          },
        },
      },
    });

    if (batches.length === 0) {
      this.logger.log('No pending batches found.');
    } else {
      for (const batch of batches) {
        this.logger.log(`Pushing walrus seal for batch ID: ${batch.id}`);
        //const payloads = batch.payloads.map((payload) => {
        //this.logger.log(`Pushing walrus seal for payload: ${JSON.stringify(payload)}`);
        //return this.walrusSealService.encryptData("0x0123456789abcdef", PACKAGE_ID, payload);
        //});
        const module_name = "allowlist";
        const suiClient = this.wallet.suiClient;
        const keypair = this.wallet.getKeypair();
        const suiAddress = this.wallet.publicKey;
        for (const payload of batch.payloads) {
          try {
            if (!payload.metadata) {
              this.logger.error(`Payload metadata is missing for batch ID: ${batch.id}`);
              continue;
            }
            const tx1 = new Transaction();
            tx1.setGasBudget(100000000);
            await tx1.moveCall({
              target: `${PACKAGE_ID}::${module_name}::create_allowlist_entry`,
              arguments: [tx1.pure.string(payload.metadata.device_id)],
            });
            const result1 = await suiClient.signAndExecuteTransaction({
              transaction: tx1,
              signer: keypair,
            });
            console.log(result1);
            await sleep(2000);
            const txDetails = await suiClient.getTransactionBlock({
              digest: result1.digest,
              options: {
                showEffects: true,
                showInput: true,
                showObjectChanges: true,
              }
            });
            const createdObjects = await txDetails.objectChanges?.filter(change => change.type === 'created') || [];
            const createdObjectIds = await createdObjects.map(obj => obj.objectId);
            await this.logger.log(`Created object IDs: ${createdObjectIds}`);
            await this.logger.log(`-------------------------------------`);
            await sleep(5000);
            // const tx = new Transaction();
            // tx.setGasBudget(100000000);
            // await tx.moveCall({
            //   target: `${PACKAGE_ID}::${module_name}::add`,
            //   arguments: [
            //     tx.object(createdObjectIds[1]),
            //     tx.object(createdObjectIds[0]),
            //     tx.pure.address(suiAddress)
            //   ],
            // });
            // const result = await suiClient.signAndExecuteTransaction({
            //   transaction: tx,
            //   signer: keypair,
            // });

          } catch (error) {
            this.logger.error(`Error encrypting payload: ${error}`);
          }
        }
        await this.databaseService.batch.update({
          where: { id: batch.id },
          data: {
            status: PrismaTransactionStatus.SENT,
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
      await this.logger.log('---- - - - DONE - - - -----');
    }
  }

  createCustomJob(name: string, cronTime: string, callback: () => void) {
    const job = new (require('cron').CronJob)(cronTime, callback);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.log(`Job ${name} created with schedule: ${cronTime}`);
  }
}