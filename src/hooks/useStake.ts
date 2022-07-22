import { useCallback } from 'react';

import useSushi from './useSushi';
import { useWallet } from 'use-wallet';

import { stake, getMasterChefContract } from '../sushi/utils';

const useStake = (dai: string, usdc: string, usdt: string, direct: boolean = false) => {
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    let zunamiContract = getMasterChefContract(sushi);

    if (chainId !== 1) {
        // zunamiContract = sushi.bscContracts.bscMasterChef;
        zunamiContract = getMasterChefContract(sushi, chainId);
    }

    const handleStake = useCallback(async () => {
        return await stake(zunamiContract, account, dai, usdc, usdt, direct, chainId);
    }, [account, dai, usdc, usdt, zunamiContract, direct, chainId]);

    return { onStake: handleStake };
};

export default useStake;
