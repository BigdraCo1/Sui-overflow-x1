import { Transaction } from '@mysten/sui/transactions';
import { getAllowlistedKeyServers, SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { fromHex } from '@mysten/bcs';
import { SuiClient } from '@mysten/sui/client';

// Constants
const PACKAGE_ID = '0x0fa339e890387266ca3463d2277d2670abb9095351bd6d7c894e7a076c320d3d'; // Remove the '...'

export class Decryptor {
  public client: SealClient;
  private suiClient: SuiClient;
  
  constructor(suiClient: any) {
    this.suiClient = suiClient;
    
    this.client = new SealClient({
        suiClient: suiClient,
        serverObjectIds: getAllowlistedKeyServers('testnet'),
        verifyKeyServers: false,
    });
    
    console.log("SealClient initialized with keyservers:", getAllowlistedKeyServers('testnet'));
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
    return await tx.build({ client: this.suiClient, onlyTransactionKind: true });
  }

  // Make public for easier testing
  public async readBlob(blobId: string): Promise<ArrayBuffer> {
    try {
      console.log(`Fetching blob ${blobId}...`);
      const response = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to retrieve blob (status ${response.status})`);
      }
      
      console.log("Blob retrieved successfully");
      return response.arrayBuffer();
    } catch (error) {
      console.error("Error retrieving blob:", error);
      throw error;
    }
  }

  async retrieveBlobs(blobIds: string[], sessionKey: SessionKey): Promise<any[]> {
    const jsonDataList: any[] = [];

    // Validate inputs
    if (!sessionKey) {
      throw new Error("Session key is missing or has no signature");
    }
    
    if (!blobIds || blobIds.length === 0) {
      throw new Error("No blob IDs provided");
    }

    // Detailed logging of session key
    console.log("Session key details:", {
      address: sessionKey.getAddress(),
      packageId: sessionKey.getPackageId(),
    });

    for (const blobId of blobIds) {
      console.log(`Processing blob ID: ${blobId}`);
      try {
        // Fetch blob data
        const validDownload = await this.readBlob(blobId);
        console.log(`Downloaded blob ${blobId}, size: ${validDownload.byteLength} bytes`);
        
        // Parse as encrypted object
        const encryptedObj = EncryptedObject.parse(new Uint8Array(validDownload));
        const fullId = encryptedObj.id;
        console.log(`Parsed blob, full ID: ${fullId}`);
        
        // Create transaction bytes
        const txb = await this.constructTxBytes("allowlist", [fullId]);
        console.log(`Created transaction bytes, length: ${txb.length}`);
        
        // Decrypt data
        console.log("Attempting decryption...");
        const decryptedBytes = await this.client.decrypt({
          data: new Uint8Array(validDownload),
          sessionKey,
          txBytes: txb,
        });
        
        console.log(`Decryption successful! Data length: ${decryptedBytes.length}`);
        
        // Parse JSON
        const textDecoder = new TextDecoder('utf-8');
        const jsonString = textDecoder.decode(decryptedBytes);
        console.log(`JSON string (preview): ${jsonString.substring(0, 100)}...`);
        
        const jsonData = JSON.parse(jsonString);
        console.log("Successfully parsed JSON");
        jsonDataList.push(jsonData);
      } catch (error: any) {
        // Enhanced error logging
        console.error(`Error processing blob ${blobId}:`, error);
        if (error instanceof NoAccessError) {
          console.error("Access denied - check permissions");
        } else if (error.message?.includes("invalid param")) {
          console.error("Invalid parameter - check input formats");
        }
        throw error;
      }
    }

    return jsonDataList;
  }
  
  async decryptBlob(blobId: string, sessionKey: SessionKey): Promise<any> {
    const results = await this.retrieveBlobs([blobId], sessionKey);
    return results[0];
  }
}

// No need for the factory function if not used