import { useState, useEffect } from 'react';
import { useWallet } from 'use-wallet';
import BigNumber from 'bignumber.js';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';

export interface PendingOperations {}

const useCalcSharesAmount = (dai: string, usdc: string, usdt: string): PendingOperations => {
    const [shares, setShares] = useState(new BigNumber(0));
    const { account } = useWallet();
    const sushi = useSushi();

    useEffect(() => {
        if (!account) {
            return;
        }

        const zunamiContract = getMasterChefContract(sushi);

        const initPendings = async () => {
            try {
                const result = await zunamiContract.calcSharesAmount([dai, usdc, usdt], false);
                setShares(result);
            } catch (error) {
                debugger;
            }
        };

        if (zunamiContract && account) {
            initPendings();
        }

        return () => {
            // contract.off(filterDeposit, depositEventHandler);
            // contract.off(filterWithdraw, withdrawEventHandler);
        };
    }, [account, sushi]);

    return shares;
};

export default useCalcSharesAmount;
