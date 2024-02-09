import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useNetwork, sepolia, mainnet, Address, erc20ABI, useAccount } from 'wagmi';
import stakingABI from '../actions/abi/sepolia/staking.json';
import { getChainClient, getZunStakingAddress } from '../utils/zunami';
import { BIG_ZERO } from '../utils/formatbalance';

function getPoolInfo(pool: PoolInfo): StakingPoolInfo {
    let result: StakingPoolInfo = {
        title: '???',
        platform: '???',
        primaryIcon: '/zunusd.svg',
        tvl: BIG_ZERO,
        apr: 0,
        balance: BIG_ZERO,
        // allowance: BIG_ZERO,
        claimed: 0,
        unclaimed: 0,
        address: '0x0000000000000000000000000000000000000000',
        maxStakingSum: BIG_ZERO,
    };

    switch (pool.token) {
        case '0x24Df9D9BB4CDD19F0Fb99c8C08631778e4DC18F0':
            result = {
                ...pool,
                title: 'zunUSD / crvUSD',
                platform: 'Stake DAO',
                primaryIcon: '/stake-dao.svg',
                tvl: BIG_ZERO,
                apr: 0,
                balance: BIG_ZERO,
                claimed: 0,
                unclaimed: 0,
                address: '0x24Df9D9BB4CDD19F0Fb99c8C08631778e4DC18F0',
                maxStakingSum: BIG_ZERO,
            };
            break;
    }

    return result;
}

export interface StakingPoolInfo {
    title: string;
    platform: string;
    primaryIcon: string;
    tvl: BigNumber;
    apr: number;
    balance: BigNumber;
    // allowance: BigNumber;
    claimed: number;
    unclaimed: number;
    address: Address;
    maxStakingSum: BigNumber;
}

type PoolInfo = {
    token: string; // Address of token contract.
    stakingToken: string; // Address of staking token contract.
    allocPoint: number; // How many allocation points assigned to this pool.
    accRewardsPerShare: number[]; // Accumulated reward token per share, times ACC_REWARD_PRECISION. See below.
    lastRewardBlocks: number[]; // Last block number that reward tokens distribution occurs.
    balance: BigNumber;
};

const useStakingPools = () => {
    const { chain } = useNetwork();
    const { address: account } = useAccount();
    const chainId = chain ? chain.id : undefined;
    const [pools, setPools] = useState<Array<StakingPoolInfo>>([]);

    useEffect(() => {
        const fetchPools = async () => {
            let result: PoolInfo[] | StakingPoolInfo[] = (await getChainClient(
                chainId
            ).readContract({
                address: getZunStakingAddress(chainId),
                abi: stakingABI,
                functionName: 'getAllPools',
            })) as PoolInfo[];

            console.log(result);

            // remove dummy data
            result = result.map((pool: PoolInfo) => getPoolInfo(pool));

            const tvls: BigInt[] = (await Promise.all(
                result.map(async (pool: StakingPoolInfo, index: number) => {
                    return getChainClient(chainId).readContract({
                        address: getZunStakingAddress(chainId),
                        abi: stakingABI,
                        functionName: 'totalAmounts',
                        args: [index],
                    });
                })
            )) as BigInt[];

            tvls.forEach((tvl: BigInt, index: number) => {
                // @ts-ignore
                result[index].tvl = new BigNumber(tvl.toString());
            });

            if (account) {
                const balances = await Promise.all(
                    result.map(async (pool: StakingPoolInfo) => {
                        return getChainClient(chainId).readContract({
                            address: pool.address as Address,
                            abi: erc20ABI,
                            functionName: 'balanceOf',
                            args: [account],
                        });
                    })
                );

                balances.forEach((balance: BigInt, index: number) => {
                    result[index].balance = new BigNumber(balance.toString());
                });
            }

            // @ts-ignore
            setPools(result);
        };

        fetchPools();
    }, [chainId, account]);

    return pools;
};

export default useStakingPools;
