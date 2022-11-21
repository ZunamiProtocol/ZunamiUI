import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';

const useBalanceOf = (contractAddress: string | undefined = undefined, autoRefresh = false) => {
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
            let contract = sushi.getEthContract();
            
            switch (chainId) {
                case 56: contract = sushi.getBscContract();  break;
                case 137: contract = sushi.getPolygonContract();  break;
            }

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

        if (autoRefresh) {
            let refreshInterval = setInterval(getBalance, 5000);
            return () => clearInterval(refreshInterval);
        }
    }, [account, chainId, masterChefContract, sushi, contractAddress, autoRefresh]);

    return balance;
};

export default useBalanceOf;
