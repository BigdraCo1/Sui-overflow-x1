import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

/**
 * Signs and executes a transaction
 * @param client The SuiClient instance
 * @param txb The transaction block to execute
 * @param keypair The keypair to sign with
 * @returns The transaction response
 */
export const signAndExecuteTransaction = async (
  client: SuiClient,
  txb: Transaction,
  keypair: Ed25519Keypair,
) => {
  try {
    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
      transaction: txb,
      signer: keypair,
    });
    
    return result;
  } catch (error) {
    console.error('Transaction execution failed:', error);
    throw error;
  }
};