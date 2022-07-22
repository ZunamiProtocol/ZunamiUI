import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useWallet } from 'use-wallet';
import { getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getAllowance } from '../utils/erc20';
import { getBalance } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
} from '../utils/formatbalance';

export const useUserBalances = () => {
    const [balance, setbalance] = useState([BIG_ZERO, BIG_ZERO, BIG_ZERO]);
    const { account, ethereum, chainId } = useWallet();

    useEffect(() => {
        const fetchbalanceStables = async () => {
            console.log(`fetchbalanceStables, chain ID: ${chainId}`);
            if (chainId === 1) {
                const balanceDai = await getBalance(
                    ethereum,
                    daiAddress,
                    // @ts-ignore
                    account
                );
                const balanceUsdc = await getBalance(
                    ethereum,
                    usdcAddress,
                    // @ts-ignore
                    account
                );
                const balanceUsdt = await getBalance(
                    ethereum,
                    usdtAddress,
                    // @ts-ignore
                    account
                );
                const data = [
                    new BigNumber(balanceDai),
                    new BigNumber(balanceUsdc),
                    new BigNumber(balanceUsdt),
                ];
                // @ts-ignore
                setbalance(data);
            } else {
                const usdtBalance = await getBalance(
                    ethereum,
                    bscUsdtAddress,
                    // @ts-ignore
                    account
                );

                setbalance([BIG_ZERO, BIG_ZERO, new BigNumber(usdtBalance)]);
            }
        };

        if (account) {
            fetchbalanceStables();
        }
        let refreshInterval = setInterval(fetchbalanceStables, 60000);
        return () => clearInterval(refreshInterval);
    }, [account, ethereum, chainId]);

    return balance;
};
