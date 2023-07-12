import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { log } from '../utils/logger';
import { useAccount, Address, erc20ABI } from 'wagmi';
import { readContract } from '@wagmi/core';

const useBalanceOf = (contractAddress: Address, autoRefresh = false) => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { address: account } = useAccount();

    useEffect(() => {
        if (!account) {
            return;
        }

        const getBalance = async () => {
            try {
                const value = await readContract({
                    address: contractAddress,
                    abi: erc20ABI,
                    functionName: 'balanceOf',
                    args: [account],
                });

                if (value) {
                    log(`🔄 Balance set to ${value}`);
                    setBalance(new BigNumber(value.toString()));
                }
            } catch (e) {
                log(
                    `Error while executing balanceOf(${account}) for ${contractAddress}: ${e.message}`
                );
            }
        };

        getBalance();

        if (autoRefresh) {
            let refreshInterval = setInterval(getBalance, 5000);
            return () => clearInterval(refreshInterval);
        }
    }, [account, contractAddress, autoRefresh]);

    return balance;
};

export default useBalanceOf;
