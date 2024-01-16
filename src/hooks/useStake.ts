import { Address, sepolia, useAccount, useNetwork } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { useMemo } from 'react';
import { contractAddresses } from '../sushi/lib/constants';
import BigNumber from 'bignumber.js';
import {
    DAI_TOKEN_DECIMAL,
    DEFAULT_TOKEN_DECIMAL,
    NULL_ADDRESS,
    USDT_TOKEN_DECIMAL,
} from '../utils/formatbalance';
import { walletClient } from '../config';
import { log } from '../utils/logger';

const useStake = (coinIndex: number, depositSum: string, receiver: Address) => {
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
            return contractAddresses.aps[chainId] ?? 1;
        }

        return NULL_ADDRESS;
    }, [chainId]);

    let preparedAmounts = [
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
    ];

    const tokenDecimals = useMemo(() => {
        if (!chainId || contractAddress === contractAddresses.aps[chainId]) {
            return DEFAULT_TOKEN_DECIMAL;
        }

        if (chainId === sepolia.id) {
            switch (coinIndex) {
                case 0:
                    return DAI_TOKEN_DECIMAL;
                case 1:
                    return USDT_TOKEN_DECIMAL;
                case 2:
                    return USDT_TOKEN_DECIMAL;
                default:
                    return USDT_TOKEN_DECIMAL;
            }
        } else {
            switch (coinIndex) {
                case 0:
                    return DAI_TOKEN_DECIMAL;
                case 1:
                    return USDT_TOKEN_DECIMAL;
                case 2:
                    return USDT_TOKEN_DECIMAL;
                default:
                    return USDT_TOKEN_DECIMAL;
            }
        }
    }, [coinIndex, chainId, contractAddress]);

    if (coinIndex !== 4) {
        // everything else
        preparedAmounts[coinIndex] = new BigNumber(depositSum).times(tokenDecimals).toString();
    } else {
        // zunUSD APS staking
        preparedAmounts[0] = new BigNumber(depositSum).times(tokenDecimals).toString();
    }

    async function onStake() {
        log(`${contractAddress}.deposit([${preparedAmounts}], '${receiver}')`);
        return await walletClient.writeContract({
            address: contractAddress,
            chain: chain,
            abi: abi,
            functionName: 'deposit',
            args: [preparedAmounts, receiver],
            account: account || NULL_ADDRESS,
        });
    }

    return {
        deposit: onStake,
    };
};

export default useStake;
