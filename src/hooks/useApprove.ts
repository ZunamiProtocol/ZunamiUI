import { Address, erc20ABI, useContractWrite } from 'wagmi';

const useApprove = (coinAddress: Address, spender: Address, amount: string) => {
    const typedAmount: bigint = BigInt(amount);

    return useContractWrite({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [spender, typedAmount],
    });
};

export default useApprove;
