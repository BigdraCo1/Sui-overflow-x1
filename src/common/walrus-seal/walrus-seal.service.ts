import { Injectable } from '@nestjs/common';
import { Wallet } from '@/config/wallet/wallet.service';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { signAndExecuteTransaction } from '@/common/helper';
import { fromHex, toHex } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { services, PACKAGE_ID, NUM_EPOCH } from '@/shared/constants';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { uploadFile } from '@/common/helper';

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
            
            const nonce = crypto.getRandomValues(new Uint8Array(5));
            const policyObjectBytes = fromHex(policyObject);
            const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
    
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
            return await uploadFile(encryptedData, epochs, deletable, keypair);
        } catch (error) {
            console.error('Failed to push data:', error);
            throw new Error(`Data push failed: ${error.message || 'Unknown error'}`);
        }
    }

    async handlePublish(wl_id: string, cap_id: string, moduleName: string, blobId: string) {
        const tx = new Transaction();
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

    async addAllowlistEntry(objectIds: string[], moduleName: string, address: string) {
        const tx = new Transaction();
        tx.setGasBudget(100000000);
        await tx.moveCall({
            target: `${PACKAGE_ID}::${moduleName}::add`,
            arguments: [tx.object(objectIds[1]), tx.object(objectIds[0]), tx.pure.address(address)],
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