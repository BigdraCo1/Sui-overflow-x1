import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import React from 'react';

export const retrieveBlob = async (
    blobIds: string[],
    sessionKey: SessionKey,
    suiClient: SuiClient,
    sealClient: SealClient,
    txBytes: Uint8Array,
    allowlistIds: string[],
) => {

}