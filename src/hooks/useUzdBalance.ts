import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

const useUzdBalance = (address: string | undefined = undefined) => {
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
            const contract = sushi.getEthContract();
            contract.options.address = address || contractAddresses.uzd[1];

            const value = await contract.methods.balanceOf(account).call();
            if (value) {
                log(`🔄 UZD Balance (contract ${contract.options.address}) set to ${value}`);
                setBalance(new BigNumber(value));
            }
        };

        getBalance();

        let refreshInterval = setInterval(getBalance, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, masterChefContract, sushi, address]);

    return balance;
};

export default useUzdBalance;
