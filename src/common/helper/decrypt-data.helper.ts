import { createDecipheriv } from 'crypto';
import { readFile } from 'fs/promises';
import * as path from 'path';

// Cache for the encryption key to avoid reading it multiple times
let cachedKey: Buffer | null = null;

/**
 * Reads the encryption key from file
 */
async function getKey(): Promise<Buffer> {
  if (cachedKey) {
    return cachedKey;
  }

  const keyFile = path.resolve(__dirname, '../../../encryption.key');
  
  try {
    const key = await readFile(keyFile);
    
    if (key.length !== 32) {
      throw new Error(`Invalid key length: expected 32, got ${key.length}`);
    }
    
    cachedKey = key;
    return key;
  } catch (err: any) {
    throw new Error(`Error reading key file: ${err.message}`);
  }
}

/**
 * Decrypts Base64-encoded AES-256-GCM data.
 * Input format: [12-byte nonce][ciphertext][16-byte auth tag]
 */
export async function decryptData(encryptedData: string): Promise<Buffer> {
    try {
      const key = await getKey();
      console.log(`Key length: ${key.length}`);
      
      const combined = Buffer.from(encryptedData, 'base64');
      console.log(`Combined data length: ${combined.length}`);
  
      if (combined.length < 12 + 16) {
        throw new Error(`Encrypted data too short: ${combined.length} bytes, need at least 28`);
      }
  
      const nonce = combined.slice(0, 12);
      const tag = combined.slice(combined.length - 16);
      const ciphertext = combined.slice(12, combined.length - 16);
      
      console.log(`Nonce length: ${nonce.length}`);
      console.log(`Tag length: ${tag.length}`);
      console.log(`Ciphertext length: ${ciphertext.length}`);
  
      const decipher = createDecipheriv('aes-256-gcm', key, nonce);
      decipher.setAuthTag(tag);
  
      try {
        // First try to update with ciphertext
        const updated = decipher.update(ciphertext);
        console.log(`Updated buffer length: ${updated.length}`);
        
        // Then try to finalize (this is where the auth check happens)
        const final = decipher.final();
        console.log(`Final buffer length: ${final.length}`);
        
        return Buffer.concat([updated, final]);
      } catch (error) {
        console.error(`Decryption error: ${error.message}`);
        throw new Error(`Authentication failed: ${error.message}`);
      }
    } catch (error) {
      console.error(`decryptData error: ${error.message}`);
      throw error;
    }
  }