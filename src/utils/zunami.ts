import { Contract } from 'web3-eth-contract';
import { contractAddresses } from '../sushi/lib/constants';

export const getTotalHoldings = async (masterChefContract: Contract): Promise<string> => {
    try {
        const totalHoldings: string = await masterChefContract.methods.totalHoldings().call();
        return totalHoldings;
    } catch (e) {
        return '0';
    }
};

export const getZunamiAddress = (chainId: number | undefined): string => {
    return chainId === 1 || !chainId ? contractAddresses.zunami[1] : contractAddresses.zunami[56];
};
