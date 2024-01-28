import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useNetwork, sepolia, mainnet } from 'wagmi';
import stakingABI from '../actions/abi/sepolia/staking.json';
import { getChainClient, getZunStakingAddress } from '../utils/zunami';

const useStakingPools = () => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const [pools, setPools] = useState([]);

    useEffect(() => {
        const fetchPools = async () => {
            switch (chainId) {
                case mainnet.id:
                    break;
                case sepolia.id:
                    const result = await getChainClient(chainId).readContract({
                        address: getZunStakingAddress(chainId),
                        abi: stakingABI,
                        functionName: 'poolInfo',
                        args: [0],
                    });

                    console.log(result);

                    break;
            }
        };

        fetchPools();
    }, [chainId]);

    return pools;
};

export default useStakingPools;
