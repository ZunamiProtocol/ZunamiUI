import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

const useZapsLpBalance = (address: string | undefined = undefined) => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { account, ethereum } = useWallet();

    const chainId = useMemo(() => {
        return parseInt(ethereum?.chainId, 16);
    }, [ethereum?.chainId]);

    const sushi = useSushi();

    useEffect(() => {
        if (!account || !chainId || !sushi) {
            return;
        }

        const getBalance = async () => {
            const contract = sushi.getApsContract();
            contract.options.address = address || contractAddresses.aps[1];

            const value = await contract.methods.balanceOf(account).call();
            if (value) {
                log(
                    `🔄 APS Balance (contract ${contract.options.address}) for wallet ${account} set to ${value}`
                );
                setBalance(new BigNumber(value));
            }
        };

        getBalance();

        let refreshInterval = setInterval(getBalance, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, sushi, address]);

    return balance;
};

export default useZapsLpBalance;
