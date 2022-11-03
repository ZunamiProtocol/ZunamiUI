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
    const { account, chainId, ethereum } = useWallet();
    const sushi = useSushi();
    const isZerionWallet = ethereum?.walletMeta?.name === 'Zerion';

    const handleUnstake = useCallback(async () => {
        if (!account) {
            return;
        }

        let zunamiContract = getMasterChefContract(sushi, chainId);

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
                chainId,
                isZerionWallet
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
                coinIndex,
                chainId,
                isZerionWallet
            );
        }
    }, [
        account,
        sushi,
        optimized,
        sharePercent,
        coinIndex,
        balance,
        chainId,
        isZerionWallet,
    ]);

    return { onUnstake: handleUnstake };
};

export default useUnstake;
