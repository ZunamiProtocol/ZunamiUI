import { Address, erc20ABI, sepolia, useContractWrite, useNetwork } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { useMemo } from 'react';
import { contractAddresses } from '../sushi/lib/constants';

const useStake = (amounts: Address, receiver: Address) => {
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

    return useContractWrite({
        address: contractAddress,
        abi,
        functionName: 'deposit',
        args: [amounts, receiver],
    });
};

export default useStake;
