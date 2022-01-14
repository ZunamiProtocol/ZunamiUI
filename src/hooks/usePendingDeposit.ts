import {useState,useEffect} from 'react';
import BigNumber from 'bignumber.js';
import {BIG_ZERO} from "../utils/formatbalance";
import useSushi from './useSushi';
import {useWallet} from 'use-wallet';

import {getMasterChefContract,getPendingDeposit} from '../sushi/utils';

const usePendingDeposit = () => {
    const {account} = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);
    const [pendingSum, setPendingSum] = useState(BIG_ZERO);

    useEffect(() => {
        const fetchPendingDeposit = async () => {
            const pendingDai = await getPendingDeposit(masterChefContract, account, 0);
            const pendingUsdc = await getPendingDeposit(masterChefContract, account, 1);
            const pendingUsdt = await getPendingDeposit(masterChefContract, account, 2);

            const result = [
                new BigNumber(pendingDai),
                new BigNumber(pendingUsdc),
                new BigNumber(pendingUsdt)
            ];

            setPendingSum(result[0].plus(result[1]).plus(result[2]));
        };

        if (masterChefContract && account) {
            fetchPendingDeposit();
        }

        let refreshInterval = setInterval(fetchPendingDeposit, 10000);
        return () => clearInterval(refreshInterval);
    }, [masterChefContract, account]);

    return pendingSum;
};

export default usePendingDeposit;
