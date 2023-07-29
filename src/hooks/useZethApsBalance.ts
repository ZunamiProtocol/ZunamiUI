import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { BIG_ZERO, getBalanceNumber } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

const useZethApsBalance = (address: string | undefined = undefined) => {
    const [balance, setBalance] = useState(BIG_ZERO);
    const { account } = useWallet();
    const sushi = useSushi();

    useEffect(() => {
        if (!account || !sushi) {
            return;
        }

        const getBalance = async () => {
            const contract = sushi.getZethApsContract();
            contract.options.address = address || contractAddresses.zethAPS[1];
            const value = await contract.methods.balanceOf(account).call();

            if (value) {
                log(`🔄 ZETH APS raw balance: ${getBalanceNumber(value)} (${value})`);

                const newVal = new BigNumber(value);

                if (newVal.toString() !== balance.toString()) {
                    setBalance(newVal);
                }
            }
        };

        getBalance();

        let refreshInterval = setInterval(getBalance, 30000);
        return () => clearInterval(refreshInterval);
    }, [account, sushi, address, balance]);

    return balance;
};

export default useZethApsBalance;
