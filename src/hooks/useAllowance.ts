import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
// import { useWallet } from 'use-wallet';
import { getMasterChefContract } from '../sushi/utils';
// import useSushi from './useSushi';
import { getAllowance, getContract } from '../utils/erc20';
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

import { Address, sepolia, mainnet, useContractRead, erc20ABI } from 'wagmi';
import { getChainClient } from '../utils/zunami';
import { zunUsdSepoliaAddress } from '../sushi/lib/constants';

export const useAllowance = (
    coinAddress: Address,
    account: Address | undefined,
    spender: Address,
    chainId: number = 1
) => {
    const [allowance, setAllowance] = useState(BIG_ZERO);

    useEffect(() => {
        if (account === NULL_ADDRESS || !account) {
            return;
        }

        const fetchAllowance = async () => {
            const val = await getCoinAllowance(coinAddress, account, spender, chainId);
            log(`${coinAddress}.allowance('${account}', '${spender}') - ${val}`);
            setAllowance(new BigNumber(val.toString()));
        };

        if (account) {
            fetchAllowance();
        }

        let refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, coinAddress, spender]);

    return allowance;
};

export default useAllowance;

export const getCoinAllowance = (
    coinAddress: Address,
    account: Address,
    spender: Address,
    chainId: number = 1
) => {
    // log(`Coin (${coinAddress}).allowance('${account}', '${spender}')`);

    return getChainClient(chainId).readContract({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [
            account, //owner
            spender, // spender
        ],
    });
};

export const useAllowanceStables = (
    account: Address = NULL_ADDRESS,
    spender: Address,
    chainId: number = 1
) => {
    const [allowance, setAllowance] = useState([
        BIG_ZERO, // DAI to APS
        BIG_ZERO, // USDC to APS
        BIG_ZERO, // USDT to APS
        BIG_ZERO, // FRAX to APS
        BIG_ZERO, // zunUSD to APS
        BIG_ZERO, // zunETH to APS
        BIG_ZERO, // ZUN
    ]);

    useEffect(() => {
        const fetchAllowance = async () => {
            switch (chainId) {
                case mainnet.id:
                    break;
                case sepolia.id:
                    const result = [
                        await getCoinAllowance(sepDaiAddress, account, spender, chainId),
                        await getCoinAllowance(sepUsdcAddress, account, spender, chainId),
                        await getCoinAllowance(sepUsdtAddress, account, spender, chainId),
                        BigInt('0'),
                        await getCoinAllowance(zunUsdSepoliaAddress, account, spender, chainId),
                        BigInt('0'),
                        BigInt('0'),
                    ].map(
                        (allowance: BigInt, index: number) => new BigNumber(allowance.toString())
                    );

                    // log(
                    //     `Allowance (sepolia): DAI - ${result[0].toString()}, USDC - ${result[1].toString()}, USDT - ${result[2].toString()}, zunUSD - ${result[4].toString()}`
                    // );

                    setAllowance(result);

                    break;
            }
        };

        if (account) {
            fetchAllowance();
        }

        let refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, spender, chainId]);

    return allowance;
};
