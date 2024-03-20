import {
    contractAddresses,
    zunUsdZapAddress,
    zunEthZapAddress,
    zunEthApsAddress,
} from '../sushi/lib/constants';
import sepoliaAbi from '../actions/abi/sepolia/controller.json';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'wagmi';

export const getZunamiAddress = (chainId: number): Address => {
    let address: Address = contractAddresses.zunami[chainId];
    return address;
};

export const getZunUsdAddress = (chainId: number): Address => {
    let address: Address = contractAddresses.zunUSD[chainId] ?? contractAddresses.zunUSD[1];
    return address;
};

export const getZunEthAddress = (chainId: number): Address => {
    let address: Address = contractAddresses.zunEth[chainId] ?? contractAddresses.zunEth[1];
    return address;
};

export const getZunEthApsAddress = (chainId: number | undefined): Address => {
    if (!chainId) {
        return zunEthApsAddress;
    }

    return contractAddresses.ethAps[chainId] ?? contractAddresses.ethAps[1];
};

export const getZunUsdApsAddress = (chainId: number | undefined): Address => {
    if (!chainId) {
        return contractAddresses.aps[1];
    }

    let address: Address = contractAddresses.aps[chainId] ?? contractAddresses.aps[1];
    return address;
};

export const getZapAddress = (
    chainId: number | undefined,
    stakingMode: string = 'UZD'
): Address => {
    if (stakingMode === 'ZETH') {
        return zunEthZapAddress;
    }

    if (!chainId) {
        return zunUsdZapAddress;
    }

    return contractAddresses.zap[chainId] ?? contractAddresses.zap[1];
};

export const getZunStakingAddress = (chainId: number | undefined): Address => {
    if (!chainId) {
        return contractAddresses.staking[1];
    }

    let address: Address = contractAddresses.staking[chainId] ?? contractAddresses.staking[1];
    return address;
};

export const getZunTokenAddress = (chainId: number | undefined): Address => {
    if (!chainId) {
        return contractAddresses.zun[1];
    }

    let address: Address = contractAddresses.zun[chainId] ?? contractAddresses.zun[1];
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
        case sepolia.id:
            address = 'sepolia.etherscan.io';
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
