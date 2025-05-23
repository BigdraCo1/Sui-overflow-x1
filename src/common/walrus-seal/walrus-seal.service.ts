import { Injectable } from '@nestjs/common';
import { Wallet } from '@/config/wallet/wallet.service';
import { getAllowlistedKeyServers, SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { signAndExecuteTransaction } from '@/common/helper';
import { fromHex, toHex } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { services, PACKAGE_ID, NUM_EPOCH, TTL_MIN } from '@/shared/constants';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { uploadFile, retrieveBlob, storeBlob, readBlob } from '@/common/helper';
import { MoveCallConstructor } from '@/shared/interfaces';
import { blob } from 'stream/consumers';

@Injectable()
export class WalrusSealService {
    private client: SealClient;
    private keypair: Ed25519Keypair;

    constructor(private readonly wallet: Wallet) {
        this.client = new SealClient({
            suiClient: this.wallet.suiClient,
            serverObjectIds: getAllowlistedKeyServers('testnet'),
            verifyKeyServers: false,
        });

        this.keypair = this.wallet.getKeypair();
    }

    async encryptData(policyObject: string, packageId: string, data: object) {
        try {
            // Convert object to JSON string, then to Uint8Array
            const jsonString = JSON.stringify(data);
            const dataBytes = new TextEncoder().encode(jsonString);

            // const nonce = crypto.getRandomValues(new Uint8Array(5));
            const policyObjectBytes = fromHex(policyObject);
            const id = toHex(new Uint8Array([...policyObjectBytes]));

            const { encryptedObject: encryptedBytes } = await this.client.encrypt({
                threshold: 2,
                packageId,
                id,
                data: dataBytes,
            });

            return {
                id,
                encryptedBytes
            };
        } catch (error) {
            console.error('Failed to encrypt data:', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    getAggregatorUrl(path: string, selectedService: string): string {
        const service = services.find((s) => s.id === selectedService);
        const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
        return `${service?.aggregatorUrl}/v1/${cleanPath}`;
    }

    getPublisherUrl(path: string, selectedService: string): string {
        const service = services.find((s) => s.id === selectedService);
        const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
        return `${service?.publisherUrl}/v1/${cleanPath}`;
    }

    async pushData(encryptedData: Uint8Array, epochs: number = NUM_EPOCH, deletable: boolean = false, keypair: Ed25519Keypair) {
        try {
            // return await uploadFile(encryptedData, epochs, deletable, keypair);
            return await storeBlob(encryptedData, epochs);
        } catch (error) {
            console.error('Failed to push data:', error);
            throw new Error(`Data push failed: ${error.message || 'Unknown error'}`);
        }
    }

    async constructMoveCall(packageId: string, moduleName: string, allowlistId: string): Promise<MoveCallConstructor> {
        return (tx: Transaction, id: string) => {
            tx.setGasBudget(100000000);
            tx.moveCall({
                target: `${packageId}::${moduleName}::seal_approve`,
                arguments: [tx.pure.vector('u8', fromHex(id)), tx.object(allowlistId)],
            });
        };
    }

    async constructTxBytes(
        moduleName: string,
        innerIds: string[],
    ): Promise<Uint8Array> {
        const tx = new Transaction();
        for (const innerId of innerIds) {
            const keyIdArg = tx.pure.vector('u8', fromHex(innerId));
            const objectArg = tx.object(innerId);
            tx.setGasBudget(100000000);
            tx.moveCall({
                target: `${PACKAGE_ID}::${moduleName}::seal_approve`,
                arguments: [keyIdArg, objectArg],
            });
        }
        return await tx.build({ client: this.wallet.suiClient, onlyTransactionKind: true });
    }

    async handlePublish(wl_id: string, cap_id: string, moduleName: string, blobId: string) {
        const tx = new Transaction();
        tx.setGasBudget(100000000);
        tx.moveCall({
            target: `${PACKAGE_ID}::${moduleName}::publish`,
            arguments: [tx.object(wl_id), tx.object(cap_id), tx.pure.string(blobId)],
        });
        return tx;
    }

    async createAllowlistEntry(name: string, moduleName: string) {
        const tx = new Transaction();
        tx.setGasBudget(100000000);
        await tx.moveCall({
            target: `${PACKAGE_ID}::${moduleName}::create_allowlist_entry`,
            arguments: [tx.pure.string(name)],
        });

        return tx;
    }

    async retrieveBlob(blobId: string//, txBytes: Uint8Array, allowlistIds: string[]
    ) {
        const sessionKey = new SessionKey({
            address: this.wallet.publicKey,
            packageId: PACKAGE_ID,
            ttlMin: TTL_MIN,
        });

        const msg = await sessionKey.getPersonalMessage()
        const sig = (await this.wallet.getKeypair().signPersonalMessage(msg)).signature;
        await sessionKey.setPersonalMessageSignature(sig);

        let validDownload;
        try {
            // validDownload = await retrieveBlob(blobId);
            validDownload = await readBlob(blobId);
        } catch (error) {
            console.error(`Error retrieving or parsing blob ${blobId}:`, error);
            throw new Error(`Failed to retrieve and parse blob: ${error.message}`);
        }

        console.log("Valid downloads:", validDownload);

        const fullId = EncryptedObject.parse(new Uint8Array(validDownload)).id;

        console.log("Full ID:", fullId);

        const txb = await this.constructTxBytes("allowlist", [fullId]);

        console.log("Transaction bytes:", txb);

        const decryptedBytes = await this.client.decrypt({
            data: new Uint8Array(validDownload),
            sessionKey,
            txBytes: txb,
        });

        try {
            const textDecoder = new TextDecoder('utf-8');
            const jsonString = textDecoder.decode(decryptedBytes);

            const jsonData = JSON.parse(jsonString);

            return jsonData;
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
    }

    async retrieveBlobs(blobIds: string[]) {
        const sessionKey = new SessionKey({
            address: this.wallet.publicKey,
            packageId: PACKAGE_ID,
            ttlMin: TTL_MIN,
        });
    
        const msg = await sessionKey.getPersonalMessage();
        const sig = (await this.wallet.getKeypair().signPersonalMessage(msg)).signature;
        await sessionKey.setPersonalMessageSignature(sig);
    
        // Initialize the array before pushing to it
        const jsonDataList: any[] = [];
        
        // Use for...of to iterate over the values, not for...in
        for (const blobId of blobIds) {
            console.log(`Processing blob ID: ${blobId}`);
            let validDownload;
            try {
                validDownload = await readBlob(blobId);
            } catch (error) {
                console.error(`Error retrieving or parsing blob ${blobId}:`, error);
                throw new Error(`Failed to retrieve and parse blob: ${error.message}`);
            }
    
            console.log(`Successfully downloaded blob: ${blobId}, data length: ${validDownload.length}`);
            
            try {
                const encryptedObj = EncryptedObject.parse(new Uint8Array(validDownload));
                const fullId = encryptedObj.id;
                console.log(`Full ID for blob ${blobId}: ${fullId}`);
    
                const txb = await this.constructTxBytes("allowlist", [fullId]);
                console.log(`Created transaction bytes for blob ${txb}`);
    
                const decryptedBytes = await this.client.decrypt({
                    data: new Uint8Array(validDownload),
                    sessionKey,
                    txBytes: txb,
                });
                console.log(`Successfully decrypted blob ${blobId}, data length: ${decryptedBytes.length}`);
    
                const textDecoder = new TextDecoder('utf-8');
                const jsonString = textDecoder.decode(decryptedBytes);
                const jsonData = JSON.parse(jsonString);
                
                console.log(`Successfully parsed JSON data for blob ${blobId}`);
                jsonDataList.push(jsonData);
            } catch (error) {
                console.error(`Error processing blob ${blobId}:`, error);
                // Optional: continue with next blob instead of failing completely
                // continue;
                throw new Error(`Failed to process blob ${blobId}: ${error.message}`);
            }
        }
    
        console.log(`Successfully processed ${jsonDataList.length} blobs`);
        return jsonDataList;
    }

    async addAllowlistEntry(allowlist: string, cap: string, moduleName: string, address: string) {
        const tx = new Transaction();
        tx.setGasBudget(100000000);
        await tx.moveCall({
            target: `${PACKAGE_ID}::${moduleName}::add`,
            arguments: [tx.object(allowlist), tx.object(cap), tx.pure.address(address)],
        });
        return tx;
    }

    async signAndExecTxn(tx: Transaction) {
        return await signAndExecuteTransaction(
            this.wallet.suiClient,
            tx,
            this.keypair,
        );
    }
}
