import BigNumber from 'bignumber.js';
import { useState, useEffect } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { useWallet } from 'use-wallet';
import { getAllowance } from '../utils/erc20';
import useSushi from './useSushi';
import { getZunamiAddress } from '../utils/zunami';
import { getMasterChefContract } from '../sushi/utils';

export const useGzlpAllowance = () => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const { account, ethereum, chainId } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        let refreshInterval: NodeJS.Timeout | undefined = undefined;
        if (!account || chainId !== 56) {
            return;
        }

        const fetchAllowance = async () => {
            const allowance = new BigNumber(
                await getAllowance(
                    ethereum,
                    getZunamiAddress(chainId),
                    masterChefContract,
                    // @ts-ignore
                    account
                )
            );

            console.log(`Allowance (GZLP): ${allowance.toNumber().toFixed(2)}`);
            setAllowance(allowance);
        };
        if (!refreshInterval) {
            fetchAllowance();
        }
        refreshInterval = setInterval(() => {
            fetchAllowance();
            clearInterval(refreshInterval);
        }, 10000);
    }, [chainId, account, ethereum, masterChefContract]);

    return allowance;
};
