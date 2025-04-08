import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { writeToFile } from '@/common/helper';
import * as fs from 'fs';
import * as path from 'path';

export class Wallet {
  private keypair: Ed25519Keypair;
  public publicKey: string;
  public rpcUrl: string;
  public suiClient: SuiClient;

  constructor() {
    this.keypair = this.loadOrCreateKeypair();
    this.publicKey = this.keypair.getPublicKey().toSuiAddress();
    this.rpcUrl = getFullnodeUrl("testnet");
    this.suiClient = new SuiClient({ url: this.rpcUrl });
  }

  private loadOrCreateKeypair(): Ed25519Keypair {
    try {
      // Try to load existing keypair from file
      const keypairPath = path.resolve(process.cwd(), 'keypair.json');
      if (fs.existsSync(keypairPath)) {
        const keyPairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        if (keyPairJson && keyPairJson.privateKey) {
          const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
          return Ed25519Keypair.fromSecretKey(secretKey);
        }
      }
      
      // If we get here, either the file doesn't exist or the data is invalid
      // Generate a new keypair
      console.warn('No valid keypair found. Generating a new keypair...');
      return this.generateAndSaveNewKeypair();
    } catch (error) {
      console.warn('Error loading keypair:', error);
      console.warn('Generating a new keypair instead...');
      return this.generateAndSaveNewKeypair();
    }
  }

  private generateAndSaveNewKeypair(): Ed25519Keypair {
    const newKeypair = new Ed25519Keypair();
    const publicAddress = newKeypair.getPublicKey().toSuiAddress();
    const privateKey = newKeypair.getSecretKey();

    const keyPairConfig = {
      publicAddress,
      privateKey
    };

    // Save the new keypair
    void writeToFile('keypair.json', JSON.stringify(keyPairConfig, null, 2));
    console.log('\nNew keypair generated and saved to keypair.json');
    console.log(`\nView your Sui account at https://explorer.polymedia.app/address/${publicAddress}?network=testnet`);

    return newKeypair;
  }

  getKeypair(): Ed25519Keypair {
    return this.keypair;
  }
}