import BigNumber from 'bignumber.js';
import { useState, useEffect } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { getZunamiAddress } from '../utils/zunami';
import { getAllowanceForToken } from './useAllowance';
import { useWallet } from 'use-wallet';
export const useGzlpAllowance = () => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const { account, chainId } = useWallet();

    useEffect(() => {
        // let refreshInterval : NodeJS.Timeout|undefined = undefined;
        // if (!account || !chain?.shortName || chain.shortName !== 'bnb') {
        //     return;
        // }
        // const fetchAllowance = async () => {
        //     const allowance = new BigNumber(await getAllowanceForToken(account, getZunamiAddress(chain.shortName), 'bsc'));
        //     console.log(`Allowance (GZLP): ${allowance.toNumber().toFixed(2)}`)
        //     setAllowance(allowance);
        // };
        // if (!refreshInterval) {
        //     fetchAllowance();
        // }
        // refreshInterval = setInterval(() => {
        //     fetchAllowance();
        //     clearInterval(refreshInterval);
        // }, 10000);
    }, [chainId, account]);

    return allowance;
};
