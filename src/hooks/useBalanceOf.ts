import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';

const useBalanceOf = () => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { chainId, account } = useWallet();
    const isEth = chainId && chainId === 1;
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        if (!account || !chainId || !masterChefContract) {
            return;
        }

        const getBalance = async () => {
            const contract = chainId === 1 ? sushi.getEthContract() : sushi.getBscContract();
            const value = await contract.methods.balanceOf(account).call();
            if (value) {
                setBalance(new BigNumber(value));
            }
        };

        getBalance();
    }, [account, chainId, isEth, masterChefContract]);

    return balance;
};

export default useBalanceOf;
