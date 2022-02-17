import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract, unstake } from '../sushi/utils';

const useUnstake = (lpShares: string, dai: string, usdc: string, usdt: string) => {
    const { account } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);
    const handleUnstake = useCallback(async () => {
        const txHash = await unstake(masterChefContract, account, lpShares, dai, usdc, usdt);
        console.log(txHash);
    }, [account, dai, usdc, usdt, lpShares, masterChefContract]);

    return { onUnstake: handleUnstake };
};

export default useUnstake;
