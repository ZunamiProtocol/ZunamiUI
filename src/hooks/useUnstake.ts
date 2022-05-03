import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract, unstake } from '../sushi/utils';
import { getBalanceNew } from '../utils/erc20';
import BigNumber from 'bignumber.js';

const useUnstake = (
    lpShares: number,
    dai: string,
    usdc: string,
    usdt: string,
    optimized: boolean,
    sharePercent: number,
    coinIndex: number
) => {
    const { account } = useWallet();
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi);

    const handleUnstake = useCallback(async () => {
        if (!account) {
            return;
        }

        const balance = await getBalanceNew(zunamiContract, account);
        const balanceToWithdraw = new BigNumber(balance)
            .multipliedBy(sharePercent / 100)
            .toFixed(0)
            .toString();

        console.log(
            `Withdraw: optimized - ${optimized}, balance to withdraw: ${balanceToWithdraw}, coin index: ${coinIndex}, account: ${account}`
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
                coinIndex
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
    }, [account, zunamiContract, optimized, sharePercent, coinIndex]);

    return { onUnstake: handleUnstake };
};

export default useUnstake;
