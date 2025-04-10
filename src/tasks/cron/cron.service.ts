import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DatabaseService } from '@/config/database/database.service';
import { WalrusSealService } from '@/common/walrus-seal/walrus-seal.service';
import { TransactionStatus as PrismaTransactionStatus } from '@prisma/client';
import { Wallet } from '@/config/wallet/wallet.service';
import { sleep } from '@/common/helper';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  // Add a lock flag to prevent concurrent executions
  private isProcessing = false;
  // Add a timestamp to track when processings started
  private processingStartTime = 0;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly databaseService: DatabaseService,
    private readonly walrusSealService: WalrusSealService,
    private readonly wallet: Wallet,
  ) { }
  @Cron(CronExpression.EVERY_MINUTE)
  async handleHourly() {
    // Check if already processing
    if (this.isProcessing) {
      // Check if processing has been running for too long (5 minutes)
      const currentTime = Date.now();
      if (currentTime - this.processingStartTime > 5 * 60 * 1000) {
        this.logger.warn('Previous job execution exceeded timeout. Forcing reset of lock.');
        this.isProcessing = false;
      } else {
        this.logger.log('Previous job execution still in progress. Skipping this cycle.');
        return;
      }
    }

    try {
      // Set the lock and record start time
      this.isProcessing = true;
      this.processingStartTime = Date.now();
      
      this.logger.log('----PUSHING WALRUS SEAL----');
      
      // Find batches and lock them via transaction
      const batches = await this.databaseService.$transaction(async (prisma) => {
        // Find pending batches
        const pendingBatches = await prisma.batch.findMany({
          where: {
            status: PrismaTransactionStatus.PENDING,
          },
          include: {
            payloads: {
              include: {
                metadata: true,
              },
            },
          },
          take: 5,
        });

        // Mark these batches as processing to prevent them from being picked up by concurrent jobs
        if (pendingBatches.length > 0) {
          for (const batch of pendingBatches) {
            await prisma.batch.update({
              where: { id: batch.id },
              data: { 
                status: 'WAITING_FOR_ALLOWLIST'
              }
            });
          }
        }
        
        return pendingBatches;
      });

      if (batches.length === 0) {
        this.logger.log('No pending batches found.');
      } else {
        for (const batch of batches) {
          this.logger.log(`Pushing walrus seal for batch ID: ${batch.id}`);
          
          // Flag to track if any payloads failed
          let hasErrors = false;
          
          for (const payload of batch.payloads) {
            try {
              if (!payload.metadata) {
                this.logger.error(`Payload metadata is missing for batch ID: ${batch.id}`);
                hasErrors = true;
                continue;
              }
              
              const module_name = "allowlist";
              const tx1 = await this.walrusSealService.createAllowlistEntry(payload.metadata.device_id, module_name);
              this.logger.log('Start transaction');
              
              const res = await this.walrusSealService.signAndExecTxn(tx1);
              await sleep(10000);
              
              const suiClient = await this.wallet.suiClient;
              const txDetails = await suiClient.getTransactionBlock({
                digest: res.digest,
                options: {
                  showEffects: true,
                  showInput: true,
                  showObjectChanges: true,
                }
              });
              
              const createdObjects = txDetails.objectChanges?.filter(change => change.type === 'created') || [];
              const createdObjectIds = createdObjects.map(obj => obj.objectId);
              
              if (createdObjectIds.length < 2) {
                throw new Error('Expected at least 2 created objects but got fewer');
              }
              
              await this.databaseService.allowlist.upsert({
                where: {
                  payloadId: payload.id
                },
                create: {
                  payloadId: payload.id,
                  capId: createdObjectIds[0],
                  allowlistId: createdObjectIds[1],
                },
                update: {
                  capId: createdObjectIds[0],
                  allowlistId: createdObjectIds[1],
                }
              });
            } catch (error) {
              hasErrors = true;
              this.logger.error(`Error processing payload: ${error.message}`);
              
              // Optional: Update the individual payload status if you want granular tracking
              // await this.databaseService.payload.update({
              //   where: { id: payload.id },
              //   data: { status: 'ERROR' } // Add status field to Payload model if needed
              // });
            }
          }
          
          // Update batch status based on success or failure
          const finalStatus = hasErrors
            ? PrismaTransactionStatus.FAILED
            : PrismaTransactionStatus.WAITING_FOR_ALLOWLIST;
            
          await this.databaseService.batch.update({
            where: { id: batch.id },
            data: {
              status: finalStatus,
              pushedAt: new Date(),
            }
          });
        }
        
        this.logger.log('---- - - - DONE - - - -----');
      }
    } catch (error) {
      this.logger.error(`Unexpected error in job execution: ${error.message}`);
    } finally {
      // Always release the lock when done, even if an error occurred
      this.isProcessing = false;
    }
  }

  createCustomJob(name: string, cronTime: string, callback: () => void) {
    const job = new (require('cron').CronJob)(cronTime, callback);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.log(`Job ${name} created with schedule: ${cronTime}`);
  }
}