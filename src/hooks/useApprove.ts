import {
    Address,
    erc20ABI,
    useContractWrite,
    usePrepareContractWrite,
    erc721ABI,
    erc4626ABI,
} from 'wagmi';
import { log } from '../utils/logger';
import { getUsdtAddress } from '../sushi/lib/constants';

const useApprove = (
    coinAddress: Address,
    spender: Address,
    amount: string,
    chainId: number | undefined
) => {
    const typedAmount: bigint = BigInt(amount);
    const abi = coinAddress === getUsdtAddress(chainId) ? erc721ABI : erc20ABI;

    // log(`${coinAddress}.approve(${spender}, ${typedAmount})`);

    const { config } = usePrepareContractWrite({
        address: coinAddress,
        // @ts-ignore
        abi: abi,
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
