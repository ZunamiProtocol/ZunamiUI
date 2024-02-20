import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { Address, useNetwork, erc20ABI } from 'wagmi';
import { Abi } from 'viem';
import { getChainClient } from '../utils/zunami';

const useTotalSupply = (contractAddress: Address, abi?: Abi) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        const fetchBalance = async () => {
            let result: BigInt = BigInt(0);

            result = await getChainClient(chainId).readContract({
                address: contractAddress,
                abi: erc20ABI,
                functionName: 'totalSupply',
            });

            setBalance(new BigNumber(result.toString()));
        };

        fetchBalance();
    }, [chainId, contractAddress]);

    return balance;
};

export default useTotalSupply;
