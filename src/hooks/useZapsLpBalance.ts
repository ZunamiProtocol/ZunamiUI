import BigNumber from 'bignumber.js';
import { useEffect, useState, useMemo } from 'react';
import { getBalanceNumber } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

const useZapsLpBalance = (address: string | undefined = undefined) => {
    const [balance, setBalance] = useState(new BigNumber(-1));
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

            const lpPrice = new BigNumber(await contract.methods.lpPrice().call());
            log(`🔄 APS LP Price: ${getBalanceNumber(lpPrice)} (${lpPrice.toString()})`);

            const value = await contract.methods.balanceOf(account).call();
            if (value) {
                log(
                    `🔄 APS Balance (contract ${contract.options.address}) for wallet ${account} set to ${value}`
                );

                const newVal = new BigNumber(value).multipliedBy(new BigNumber(lpPrice));

                if (newVal.toString() !== balance.toString()) {
                    setBalance(new BigNumber(value));
                }
            }
        };

        getBalance();

        let refreshInterval = setInterval(getBalance, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, sushi, address, balance]);

    return balance;
};

export default useZapsLpBalance;
