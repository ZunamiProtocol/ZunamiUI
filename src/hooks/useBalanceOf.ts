import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO, NULL_ADDRESS } from '../utils/formatbalance';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { Address, useAccount, useContractRead, useNetwork, sepolia } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { Abi } from 'viem';

const useBalanceOf = (contractAddress: Address, abi?: Abi, autoRefresh = false) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));

    const { refetch, isRefetching } = useContractRead({
        address: contractAddress,
        abi: abi,
        functionName: 'balanceOf',
        args: [account],
        staleTime: 10_000,
        enabled: account !== undefined,
        onError(error) {
            log(`[${contractAddress}]->balanceOf() - ERROR: ${error}`);
            log(JSON.stringify(error));
            setBalance(BIG_ZERO);
        },
        onSuccess(value: BigInt) {
            log(`[${contractAddress}]->balanceOf(${account}). Result: ${value})`);

            setBalance(new BigNumber(value.toString()));

            setTimeout(() => {
                refetch();
                log(`[${contractAddress}]->balanceOf(${account}). Result: ${value})`);
            }, 5000);
        },
    });

    // console.log(isRefetching);

    return balance;
};

export default useBalanceOf;
