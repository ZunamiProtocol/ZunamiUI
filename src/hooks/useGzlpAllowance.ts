import BigNumber from 'bignumber.js';
import { useState, useEffect } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { useWallet } from 'use-wallet';
import { getAllowance } from '../utils/erc20';
import useSushi from './useSushi';
import { getZunamiAddress, isBSC, isPLG } from '../utils/zunami';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';

export const useGzlpAllowance = () => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const { account, ethereum, chainId } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        let refreshInterval: NodeJS.Timeout | undefined = undefined;
        if (!account || (!isBSC(chainId) && !isPLG(chainId))) {
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

            log(`Allowance (GZLP): ${allowance.toString()}`);
            setAllowance(allowance);
        };

        if (account && masterChefContract) {
            fetchAllowance();
        }

        refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [chainId, account, ethereum, masterChefContract]);

    return allowance;
};
