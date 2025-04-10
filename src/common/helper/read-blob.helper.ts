// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

/**
 * Retrieve a blob from Walrus storage and convert it back to a JSON object
 * @param blobId The ID of the blob to retrieve
 * @returns
 */
export async function retrieveBlob(blobId: string) {
    try {
        return await walrusClient.readBlob({ blobId });
    } catch (error) {
        console.error(`Error retrieving or parsing blob ${blobId}:`, error);
        throw new Error(`Failed to retrieve and parse blob: ${error.message}`);
    }
}

// (async function main() {
// 	const blob = await retrieveBlob('OFrKO0ofGc4inX8roHHaAB-pDHuUiIA08PW4N2B2gFk');

// 	const textDecoder = new TextDecoder('utf-8');
// 	const resultString = textDecoder.decode(await blob.arrayBuffer());

// 	console.log(resultString);
// })();
