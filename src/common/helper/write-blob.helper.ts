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
	packageConfig: {
		systemObjectId: '0x98ebc47370603fe81d9e15491b2f1443d619d1dab720d586e429ed233e1255c1',
		stakingPoolId: '0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d',
	},
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

export const storeBlob = async (encryptedData: Uint8Array, epochs: number = 3) => {
    return fetch(`https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=${epochs}`, {
      method: 'PUT',
      body: encryptedData,
    }).then((response) => {
      if (response.status === 200) {
        console.log("blob stored successfully");
        console.log("response: ", response);
        return response.json().then((info) => {
          return { info };
        });
      } else {
        throw new Error('Something went wrong when storing the blob!');
      }
    });
  };