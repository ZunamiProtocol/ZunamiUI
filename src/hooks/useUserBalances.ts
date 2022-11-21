import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useWallet } from 'use-wallet';
import { getBalance } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { isBSC, isETH, isPLG } from '../utils/zunami';

export const useUserBalances = () => {
    const [balance, setbalance] = useState([BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO]);
    const { account, ethereum, chainId } = useWallet();

    useEffect(() => {
        const fetchbalanceStables = async () => {
            log(`fetchbalanceStables, chain ID: ${chainId}`);
            if (isETH(chainId)) {
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
                    BIG_ZERO,
                ];
                // @ts-ignore
                setbalance(data);
            } else if (isBSC(chainId)) {
                const usdtBalance = await getBalance(
                    ethereum,
                    bscUsdtAddress,
                    // @ts-ignore
                    account
                );

                const busdBalance = await getBalance(
                    ethereum,
                    busdAddress,
                    // @ts-ignore
                    account
                );

                setbalance([
                    BIG_ZERO,
                    BIG_ZERO,
                    new BigNumber(usdtBalance),
                    new BigNumber(busdBalance),
                ]);
            } else if (isPLG(chainId)) {
                const balanceUsdt = await getBalance(
                    ethereum,
                    plgUsdtAddress,
                    // @ts-ignore
                    account
                );
                const data = [
                    BIG_ZERO,
                    BIG_ZERO,
                    new BigNumber(balanceUsdt),
                    BIG_ZERO,
                ];
                // @ts-ignore
                setbalance(data);
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
