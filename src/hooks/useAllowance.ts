import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO, NULL_ADDRESS } from '../utils/formatbalance';
import { log } from '../utils/logger';

import { Address, erc20ABI } from 'wagmi';
import { getChainClient, getZunUsdAddress, getZunUsdApsAddress } from '../utils/zunami';
import { getDaiAddress, getUsdcAddress, getUsdtAddress } from '../sushi/lib/constants';

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

        let refreshInterval = setInterval(fetchAllowance, 5000);
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

export function getTokenAddressByIndex(index: number, chainId: number) {
    let result = getUsdtAddress(chainId);

    switch (index) {
        case 0:
            result = getDaiAddress(chainId);
            break;
        case 1:
            result = getUsdcAddress(chainId);
            break;
        case 2:
            result = getUsdtAddress(chainId);
            break;
        case 4:
            result = getZunUsdApsAddress(chainId);
            break;
        case 5:
            result = getZunUsdApsAddress(chainId);
            break;
    }

    return result;
}

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
            let result = [BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO];

            result = [
                await getCoinAllowance(getDaiAddress(chainId), account, spender, chainId),
                await getCoinAllowance(getUsdcAddress(chainId), account, spender, chainId),
                await getCoinAllowance(getUsdtAddress(chainId), account, spender, chainId),
                BigInt('0'),
                await getCoinAllowance(getZunUsdAddress(chainId), account, spender, chainId),
                BigInt('0'),
                BigInt('0'),
            ].map((allowance: BigInt, index: number) => new BigNumber(allowance.toString()));

            log(
                `Allowance (spender ${spender}): DAI - ${result[0].toString()}, USDC - ${result[1].toString()}, USDT - ${result[2].toString()}, zunUSD - ${result[4].toString()}`
            );

            setAllowance(result);
        };

        if (account) {
            fetchAllowance();
        }

        let refreshInterval = setInterval(fetchAllowance, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, spender, chainId]);

    return allowance;
};
