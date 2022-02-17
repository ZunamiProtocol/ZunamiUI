import { useCallback } from 'react';

import useSushi from './useSushi';
import { useWallet } from 'use-wallet';

import { stake, getMasterChefContract } from '../sushi/utils';

const useStake = (dai: string, usdc: string, usdt: string) => {
    const { account } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);
    const handleStake = useCallback(async () => {
        const txHash = await stake(masterChefContract, account, dai, usdc, usdt);
        console.log(txHash);
    }, [account, dai, usdc, usdt, masterChefContract]);

    return { onStake: handleStake };
};

export default useStake;
