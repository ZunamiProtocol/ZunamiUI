import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract, unstake } from '../sushi/utils';
import BigNumber from 'bignumber.js';
import { log } from '../utils/logger';

const useUnstake = (
    balance: BigNumber,
    optimized: boolean,
    sharePercent: number,
    coinIndex: number
) => {
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi, chainId);

    const handleUnstake = useCallback(async () => {
        if (!account) {
            return;
        }

        const balanceToWithdraw = balance
            .multipliedBy(sharePercent / 100)
            .toFixed(0)
            .toString();

        log(
            `Raw balance: ${balance.toString()}, percent (${sharePercent}) - ${balanceToWithdraw.toString()}`
        );

        if (optimized) {
            return await unstake(
                zunamiContract,
                account,
                balanceToWithdraw,
                0,
                0,
                0,
                true,
                coinIndex,
                chainId
            );
        } else {
            return await unstake(
                zunamiContract,
                account,
                balanceToWithdraw,
                0,
                0,
                0,
                false,
                coinIndex
            );
        }
    }, [account, zunamiContract, optimized, sharePercent, coinIndex, balance, chainId]);

    return { onUnstake: handleUnstake };
};

export default useUnstake;
