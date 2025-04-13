// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Agent, setGlobalDispatcher } from 'undici';
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

setGlobalDispatcher(
	new Agent({
		connectTimeout: 60_000,
		connect: { timeout: 60_000 },
	}),
);

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
	storageNodeClientOptions: {
		timeout: 60_000,
	},
});

/**
 * Upload encrypted data to Walrus storage
 * @param encryptedData The encrypted data as a Uint8Array
 * @returns The response from writeBlob
 */
export async function uploadFile(encryptedData: Uint8Array, epochs: number = 3, deletable: boolean = false, keypair: Ed25519Keypair) {
    return await walrusClient.writeBlob({
        blob: encryptedData,
        deletable: deletable,
        epochs: epochs,
        signer: keypair,
    });
}