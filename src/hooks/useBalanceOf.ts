import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
// import useWallet from './useWallet';
// import useSushi from './useSushi';
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
            log('[SMART] Error while retrieving balanceOf()');
            log(JSON.stringify(error));
            setBalance(BIG_ZERO);
        },
        onSuccess(value: BigInt) {
            log(
                `[SMART] balanceOf (contract ${contractAddress}) for address ${account}. Balance: ${value})`
            );

            setBalance(new BigNumber(value.toString()));

            setTimeout(() => {
                refetch();
                log(`[SMART] balanceOf (contract ${contractAddress}) for address ${account}`);
            }, 5000);
        },
    });

    // console.log(isRefetching);

    return balance;
};

export default useBalanceOf;
