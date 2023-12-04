import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { Address, useContractRead } from 'wagmi';

const useBalanceOf = (
    contractAddress: Address,
    account: Address,
    abi: any,
    autoRefresh = false
) => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { refetch, isRefetching } = useContractRead({
        address: contractAddress,
        abi: abi,
        functionName: 'balanceOf',
        args: [account],
        staleTime: 10_000,
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
