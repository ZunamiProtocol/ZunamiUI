import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useNetwork, sepolia, mainnet, Address, erc20ABI, useAccount } from 'wagmi';
import stakingABI from '../actions/abi/sepolia/staking.json';
import { getChainClient, getZunStakingAddress } from '../utils/zunami';

function getPoolInfo(poolIndex: string): StakingPoolInfo {
    let result: StakingPoolInfo = {
        title: '???',
        platform: '???',
        primaryIcon: '/zunusd.svg',
        tvl: '0',
        apr: 0,
        deposit: 0,
        claimed: 0,
        unclaimed: 0,
        address: '0x0000000000000000000000000000000000000000',
    };

    switch (poolIndex) {
        case '0x24Df9D9BB4CDD19F0Fb99c8C08631778e4DC18F0':
            result = {
                title: 'zunUSD / crvUSD',
                platform: 'Stake DAO',
                primaryIcon: '/stake-dao.svg',
                tvl: '6.6m',
                apr: 16,
                deposit: 0,
                claimed: 0,
                unclaimed: 0,
                address: '0x24Df9D9BB4CDD19F0Fb99c8C08631778e4DC18F0',
            };
            break;
    }

    return result;
}

const IGNORED_POOLS = ['0x0000000000000000000000000000000000000000', '100'];

export interface StakingPoolInfo {
    title: string;
    platform: string;
    primaryIcon: string;
    tvl: string;
    apr: number;
    deposit: number;
    claimed: number;
    unclaimed: number;
    address: Address;
}

const useStakingPools = () => {
    const { chain } = useNetwork();
    const { address: account } = useAccount();
    const chainId = chain ? chain.id : undefined;
    const [pools, setPools] = useState<Array<StakingPoolInfo>>([]);

    useEffect(() => {
        const fetchPools = async () => {
            let result: any = await getChainClient(chainId).readContract({
                address: getZunStakingAddress(chainId),
                abi: stakingABI,
                functionName: 'poolInfo',
                args: [0],
                // functionName: 'getAllPools',
            });

            // remove dummy data
            result = result
                .filter((address: string) => IGNORED_POOLS.indexOf(address.toString()) === -1)
                .map((poolAddress: string) => getPoolInfo(poolAddress));

            if (account) {
                result = await result.map(async (pool: StakingPoolInfo) => {
                    const balance = await getChainClient(chainId).readContract({
                        address: pool.address,
                        abi: erc20ABI,
                        functionName: 'balanceOf',
                        args: [account],
                    });

                    console.log(balance);
                });
            }

            // console.log(result);

            // @ts-ignore
            setPools(result);
        };

        fetchPools();
    }, [chainId]);

    return pools;
};

export default useStakingPools;
