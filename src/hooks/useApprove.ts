import { Address, erc20ABI, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { log } from '../utils/logger';
import { NULL_ADDRESS } from '../utils/formatbalance';

const useApprove = (coinAddress: Address, spender: Address, amount: string) => {
    const typedAmount: bigint = BigInt(amount);

    const { config } = usePrepareContractWrite({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [spender, typedAmount],
    });

    const result = useContractWrite(config);

    if (result.isLoading) {
        log(`[SMART] calling approve of ${coinAddress}. Params: ('${spender}', '${typedAmount}')`);
    }

    return result;
};

export default useApprove;
