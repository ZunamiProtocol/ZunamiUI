import { Contract } from 'web3-eth-contract';
import { contractAddresses } from '../sushi/lib/constants';
import sepoliaAbi from '../actions/abi/sepolia/controller.json';
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'wagmi';

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
export const isSEP = (chainId: number | undefined) => chainId === sepolia.id;
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

export function getAbiByChainId(chainId: number) {
    let result = sepoliaAbi;

    switch (chainId) {
        case 1:
            result = sepoliaAbi;
            break;
    }

    return result;
}

function getChainById(chainId: number) {
    let result: any = mainnet;

    switch (chainId) {
        case sepolia.id:
            result = sepolia;
            break;
    }

    return result;
}

export function getChainClient(chainId: number = 1) {
    return createPublicClient({
        chain: getChainById(chainId),
        transport: http(),
    });
}
