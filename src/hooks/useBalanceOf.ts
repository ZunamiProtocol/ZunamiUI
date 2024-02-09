import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO, NULL_ADDRESS } from '../utils/formatbalance';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import {
    Address,
    useAccount,
    useContractRead,
    useNetwork,
    sepolia,
    mainnet,
    erc20ABI,
} from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { Abi } from 'viem';
import { getChainClient } from '../utils/zunami';

const useBalanceOf = (contractAddress: Address, abi?: Abi, autoRefresh = false) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        const fetchBalance = async () => {
            if (!account) {
                return;
            }

            switch (chainId) {
                case mainnet.id:
                    break;
                case sepolia.id:
                    const result = await getChainClient(chainId).readContract({
                        address: contractAddress,
                        abi: erc20ABI,
                        functionName: 'balanceOf',
                        args: [
                            account, //owner
                        ],
                    });

                    // log(
                    //     `[${contractAddress}]->balanceOf(${account}). Result: ${result.toString()})`
                    // );
                    setBalance(new BigNumber(result.toString()));

                    break;
            }
        };

        if (account) {
            fetchBalance();
        }

        let refreshInterval = setInterval(fetchBalance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, contractAddress]);

    return balance;
};

export default useBalanceOf;
