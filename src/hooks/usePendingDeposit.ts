import {useState,useEffect,useMemo} from 'react';
import BigNumber from 'bignumber.js';
import {BIG_ZERO} from "../utils/formatbalance";
import {useWallet} from 'use-wallet';
import { getContract } from '../utils/erc20';
import { contractAddresses } from '../sushi/lib/constants';
import {getPendingDeposit} from '../sushi/utils';
import config from "../config";

const usePendingDeposit = () => {
    const {account,ethereum} = useWallet();
    const { CHAIN_ID } = config;

    const masterChefContract = useMemo(() => {
        // @ts-ignore
        return getContract(ethereum, contractAddresses.masterChef[CHAIN_ID]);
    }, [ethereum, CHAIN_ID]);
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
