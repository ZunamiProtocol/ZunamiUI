import BigNumber from 'bignumber.js';
import {useEffect, useState} from 'react';
import {useWallet} from 'use-wallet';
import {getMasterChefContract} from '../sushi/utils';
import useSushi from "./useSushi";
import {getUserLpAmount} from "../utils/erc20";
import {BIG_ZERO} from "../utils/formatbalance";

const useUserLpAmount = () => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const {account} = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        const fetchAllowance = async () => {
            const allowance = await getUserLpAmount(
                masterChefContract,
                // @ts-ignore
                account,
            );
            setAllowance(new BigNumber(allowance));
        };

        if (account && masterChefContract) {
            fetchAllowance();
        }
        let refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, masterChefContract]);

    return allowance;
};

export default useUserLpAmount;

