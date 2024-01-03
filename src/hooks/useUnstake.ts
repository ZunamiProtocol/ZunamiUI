import { Address, sepolia, useAccount, useNetwork } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { useMemo } from 'react';
import { contractAddresses } from '../sushi/lib/constants';
import BigNumber from 'bignumber.js';
import {
    BIG_TEN,
    DAI_TOKEN_DECIMAL,
    NULL_ADDRESS,
    USDT_TOKEN_DECIMAL,
    UZD_DECIMALS,
} from '../utils/formatbalance';
import { walletClient } from '../config';
import { log } from '../utils/logger';

const useUnstake = (
    shares: string,
    minTokenAmounts: Array<string> = ['0', '0', '0', '0', '0'],
    receiver: Address
) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();

    const abi = useMemo(() => {
        if (chainId === sepolia.id) {
            return sepControllerAbi;
        } else {
            return sepControllerAbi;
        }
    }, [chainId]);

    const contractAddress = useMemo(() => {
        if (chainId === sepolia.id) {
            return contractAddresses.zunami[sepolia.id];
        }

        return NULL_ADDRESS;
    }, [chainId]);

    async function onUnstake() {
        log(`Withdraw ${contractAddress} - (${shares}, ${minTokenAmounts}, '${receiver}')`);

        const sumToWithdraw = new BigNumber(shares)
            .multipliedBy(BIG_TEN.pow(UZD_DECIMALS))
            .toString();

        return await walletClient.writeContract({
            address: contractAddress,
            chain: chain,
            abi: abi,
            functionName: 'withdraw',
            args: [sumToWithdraw, minTokenAmounts, receiver],
            account: account || NULL_ADDRESS,
        });
    }

    return {
        withdraw: onUnstake,
    };
};

export default useUnstake;
