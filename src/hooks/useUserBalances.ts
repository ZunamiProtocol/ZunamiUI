import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import { BIG_ZERO, NULL_ADDRESS } from '../utils/formatbalance';
import { log } from '../utils/logger';
import {
    getChainClient,
    getZunEthAddress,
    getZunUsdAddress,
    getZunUsdApsAddress,
} from '../utils/zunami';
import { getDaiAddress, getUsdcAddress, getUsdtAddress } from '../sushi/lib/constants';
import { Address } from 'viem';
import { erc20ABI } from 'wagmi';

function getCoinBalance(coinAddress: Address, account: Address, chainId: number = 1) {
    return getChainClient(chainId).readContract({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account],
    });
}

export const coins = ['DAI', 'USDC', 'USDT', 'FRAX', 'zunUSD', 'zunETH', 'apsZunUSDLP', 'ZUN'];

export function getCoinAddressByIndex(index: number, chainId: number): Address {
    let result: Address = NULL_ADDRESS;

    switch (index) {
        case 0: // DAI
            result = getDaiAddress(chainId);
            break;
        case 1: // USDC
            result = getUsdcAddress(chainId);
            break;
        case 2: // USDT
            result = getUsdtAddress(chainId);
            break;
        case 3: // FRAX
            result = NULL_ADDRESS;
            break;
        case 4: // ZunUSD
            result = getZunUsdAddress(chainId);
            break;
        case 5: // ZunETH
            result = getZunEthAddress(chainId);
            break;
        case 6: // apsZunUSDLP
            result = getZunUsdApsAddress(chainId);
            break;
    }

    return result;
}

export function coinAddressToHumanName(address: Address, chainId: number): string {
    let result = 'UNKNOWN';

    switch (address) {
        case getDaiAddress(chainId):
            result = 'DAI(sepolia)';
            break;
        case getUsdcAddress(chainId):
            result = 'USDC(sepolia)';
            break;
        case getUsdtAddress(chainId):
            result = 'USDT(sepolia)';
            break;
    }

    return result;
}

export const useUserBalances = (account: Address = NULL_ADDRESS, chainId: number | undefined) => {
    const [balance, setBalance] = useState([
        BIG_ZERO, // DAI
        BIG_ZERO, // USDC
        BIG_ZERO, // USDT
        BIG_ZERO, // FRAX
        BIG_ZERO, // zunUSD
        BIG_ZERO, // zunETH
        BIG_ZERO, // apsZunUSDLP
    ]);

    useEffect(() => {
        const fetchbalanceStables = async () => {
            if (account === NULL_ADDRESS || !chainId) {
                return;
            }

            let result = [BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO];

            result = [
                await getCoinBalance(getDaiAddress(chainId), account, chainId),
                await getCoinBalance(getUsdcAddress(chainId), account, chainId),
                await getCoinBalance(getUsdtAddress(chainId), account, chainId),
                BigInt('0'),
                await getCoinBalance(getZunUsdAddress(chainId), account, chainId), // zunUSD
                BigInt('0'),
                await getCoinBalance(getZunUsdApsAddress(chainId), account, chainId), // apsZunUSDLP
            ].map((balance: BigInt) => new BigNumber(balance.toString()));

            log(
                `Balance (mainnet): DAI - ${result[0].toString()}, USDC - ${result[1].toString()}, USDT - ${result[2].toString()}, zunUSD - ${result[4].toString()}`
            );

            setBalance(result);
        };

        if (account) {
            fetchbalanceStables();
        }

        let refreshInterval = setInterval(fetchbalanceStables, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId]);

    return balance;
};
