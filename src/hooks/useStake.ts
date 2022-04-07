import { useCallback } from 'react';

import useSushi from './useSushi';
import { useWallet } from 'use-wallet';

import { stake, getMasterChefContract } from '../sushi/utils';

const useStake = (dai: string, usdc: string, usdt: string, direct: boolean = false) => {
    const { account } = useWallet();
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi);

    const handleStake = useCallback(async () => {
        return await stake(zunamiContract, account, dai, usdc, usdt, direct);
    }, [account, dai, usdc, usdt, zunamiContract, direct]);

    return { onStake: handleStake };
};

export default useStake;
