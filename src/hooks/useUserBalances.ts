import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { getBalance } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
    fraxAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { isBSC, isETH, isPLG } from '../utils/zunami';
import { contractAddresses } from '../sushi/lib/constants';
import { useAccount, useNetwork } from 'wagmi';

export const useUserBalances = () => {
    const [balance, setbalance] = useState([
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
    ]);

    const { chain } = useNetwork();
    const chainId = chain && chain.id;
    const { address: account } = useAccount();

    useEffect(() => {
        if (!account) {
            return;
        }

        const fetchbalanceStables = async () => {
            log(`fetchbalanceStables, chain ID: ${chainId}`);
            if (isETH(chainId)) {
                const balanceDai = await getBalance(daiAddress, account);
                const balanceUsdc = await getBalance(usdcAddress, account);
                const balanceUsdt = await getBalance(usdtAddress, account);
                const balanceFrax = await getBalance(fraxAddress, account);
                const balanceUzd = await getBalance(
                    contractAddresses.uzd[1],
                    // @ts-ignore
                    account
                );
                const data = [
                    new BigNumber(balanceDai),
                    new BigNumber(balanceUsdc),
                    new BigNumber(balanceUsdt),
                    BIG_ZERO,
                    new BigNumber(balanceFrax),
                    new BigNumber(balanceUzd),
                ];
                // @ts-ignore
                setbalance(data);
            } else if (isBSC(chainId)) {
                const usdtBalance = await getBalance(
                    bscUsdtAddress,
                    // @ts-ignore
                    account
                );

                const busdBalance = await getBalance(
                    busdAddress,
                    // @ts-ignore
                    account
                );

                setbalance([
                    BIG_ZERO,
                    BIG_ZERO,
                    new BigNumber(usdtBalance),
                    new BigNumber(busdBalance),
                    BIG_ZERO,
                ]);
            } else if (isPLG(chainId)) {
                const balanceUsdt = await getBalance(
                    plgUsdtAddress,
                    // @ts-ignore
                    account
                );
                const data = [BIG_ZERO, BIG_ZERO, new BigNumber(balanceUsdt), BIG_ZERO, BIG_ZERO];
                // @ts-ignore
                setbalance(data);
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
