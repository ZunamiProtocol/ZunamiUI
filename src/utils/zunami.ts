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
    let address = contractAddresses.zunami[1];
    return address;
};

export const isBSC = (chainId: number | undefined) => chainId === 56;
export const isETH = (chainId: number | undefined) => chainId === 1;
export const isPLG = (chainId: number | undefined) => chainId === 137;

export const getScanAddressByChainId = (chainId: number) => {
    let address = 'etherscan.io';

    switch (chainId) {
        case 56:
            address = 'bscscan.com';
            break;
        case 137:
            address = 'polygonscan.com';
            break;
    }

    return address;
};
