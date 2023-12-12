import { Address, erc20ABI, sepolia, useContractWrite, useNetwork } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { useMemo } from 'react';
import { contractAddresses } from '../sushi/lib/constants';
import BigNumber from 'bignumber.js';
import { BIG_TEN, BIG_ZERO } from '../utils/formatbalance';

const useStake = (coinIndex: number, depositSum: string, receiver: Address) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;

    const abi = useMemo(() => {
        if (chainId === sepolia.id) {
            return sepControllerAbi;
        }
    }, [chainId]);

    const contractAddress = useMemo(() => {
        if (chainId === sepolia.id) {
            return contractAddresses.zunami[sepolia.id];
        }
    }, [chainId]);

    const preparedAmounts = [
        new BigNumber(1000).toString(),
        new BigNumber(1000).toString(),
        new BigNumber(1000).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
    ];
    // preparedAmounts[coinIndex] = new BigNumber(depositSum).multipliedBy(BIG_TEN).toNumber();

    return useContractWrite({
        address: contractAddress,
        abi,
        functionName: 'deposit',
        args: [preparedAmounts, receiver],
    });
};

export default useStake;
