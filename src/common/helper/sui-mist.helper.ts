import { MIST_PER_SUI } from '@mysten/sui/utils';

// Convert MIST to Sui
export const balance = (balance) => {
	return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};