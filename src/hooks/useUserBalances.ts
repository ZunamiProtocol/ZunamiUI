import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
// import { useWallet } from 'use-wallet';
import { getBalance } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    fraxAddress,
    NULL_ADDRESS,
    sepDaiAddress,
    sepUsdcAddress,
    sepUsdtAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { getAbiByChainId, getChainClient, isBSC, isETH, isPLG } from '../utils/zunami';
import { zunUsdSepoliaAddress, zunUsdMainnetAddress } from '../sushi/lib/constants';
import { Address } from 'viem';
import { erc20ABI, mainnet, sepolia } from 'wagmi';

function getCoinBalance(coinAddress: Address, account: Address, chainId: number = 1) {
    return getChainClient(chainId).readContract({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account],
    });
}

export const coins = ['DAI', 'USDC', 'USDT', 'FRAX', 'zunUSD', 'zunETH', 'ZUN'];

export function getCoinAddressByIndex(index: number, chainId: number): Address {
    let result: Address = NULL_ADDRESS;

    switch (chainId) {
        case mainnet.id:
            switch (index) {
                case 0: // DAI
                    result = daiAddress;
                    break;
                case 1: // USDC
                    result = usdcAddress;
                    break;
                case 2: // USDT
                    result = usdtAddress;
                    break;
                case 3: // FRAX
                    result = NULL_ADDRESS;
                    break;
                case 4: // ZunUSD
                    result = zunUsdMainnetAddress;
                    break;
            }
            break;
        case sepolia.id:
            switch (index) {
                case 0:
                    result = sepDaiAddress;
                    break;
                case 1:
                    result = sepUsdcAddress;
                    break;
                case 2:
                    result = sepUsdtAddress;
                    break;
                case 3:
                    result = NULL_ADDRESS;
                    break;
                case 4:
                    result = zunUsdSepoliaAddress;
                    break;
            }
            break;
    }

    return result;
}

export function coinAddressToHumanName(address: Address): string {
    let result = 'UNKNOWN';

    switch (address) {
        case sepDaiAddress:
            result = 'DAI(sepolia)';
            break;
        case sepUsdcAddress:
            result = 'USDC(sepolia)';
            break;
        case sepUsdtAddress:
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
        BIG_ZERO, // ZUN
    ]);

    useEffect(() => {
        const fetchbalanceStables = async () => {
            if (account === NULL_ADDRESS || !chainId) {
                return;
            }

            let result = [BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO];

            switch (chainId) {
                case mainnet.id:
                    result = [
                        await getCoinBalance(daiAddress, account, chainId),
                        await getCoinBalance(usdcAddress, account, chainId),
                        await getCoinBalance(usdtAddress, account, chainId),
                        BigInt('0'),
                        await getCoinBalance(zunUsdMainnetAddress, account, chainId),
                        BigInt('0'),
                        BigInt('0'),
                    ].map((balance: BigInt) => new BigNumber(balance.toString()));

                    log(
                        `Balance (mainnet): DAI - ${result[0].toString()}, USDC - ${result[1].toString()}, USDT - ${result[2].toString()}, zunUSD - ${result[4].toString()}`
                    );

                    setBalance(result);
                    break;
                case sepolia.id:
                    result = [
                        await getCoinBalance(sepDaiAddress, account, chainId),
                        await getCoinBalance(sepUsdcAddress, account, chainId),
                        await getCoinBalance(sepUsdtAddress, account, chainId),
                        BigInt('0'),
                        await getCoinBalance(zunUsdSepoliaAddress, account, chainId),
                        BigInt('0'),
                        BigInt('0'),
                    ].map((balance: BigInt) => new BigNumber(balance.toString()));

                    log(
                        `Balance (sepolia): DAI - ${result[2].toString()}, USDC - ${result[3].toString()}, USDT - ${result[4].toString()}`
                    );

                    setBalance(result);

                    break;
            }
        };

        if (account) {
            fetchbalanceStables();
        }

        let refreshInterval = setInterval(fetchbalanceStables, 60000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId]);

    return balance;
};
