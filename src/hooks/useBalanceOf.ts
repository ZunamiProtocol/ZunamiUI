import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';

const useBalanceOf = (contractAddress: string | undefined = undefined) => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { account, ethereum } = useWallet();

    const chainId = useMemo(() => {
        return parseInt(ethereum?.chainId, 16);
    }, [ethereum?.chainId]);

    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        if (!account || !chainId || !masterChefContract) {
            return;
        }

        const getBalance = async () => {
            const contract = chainId === 1 ? sushi.getEthContract() : sushi.getBscContract();

            if (contractAddress) {
                contract.options.address = contractAddress;
            }

            const value = await contract.methods.balanceOf(account).call();
            if (value) {
                log(`🔄 Balance set to ${value}`);
                setBalance(new BigNumber(value));
            }
        };

        getBalance();
    }, [account, chainId, masterChefContract, sushi, contractAddress]);

    return balance;
};

export default useBalanceOf;
