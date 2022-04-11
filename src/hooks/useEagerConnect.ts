import { useEffect } from 'react';
import { LS_ACCOUNT_KEY, LS_WALLET_TYPE_KEY } from '../components/WalletStatus/WalletStatus';

/**
 * Eager wallet connection from saved data in local storage
 * @param {string} account Account address
 * @param {function} connect Connect function
 * @param {object} ethereum
 */
const useEagerConnect = (account: string, connect: any, ethereum: any) => {
    useEffect(() => {
        const connectorId = window.localStorage.getItem(LS_ACCOUNT_KEY);
        const walletType = window.localStorage.getItem(LS_WALLET_TYPE_KEY);

        if (!account && connectorId) {
            connect(walletType || 'injected');
        }
    }, [account, connect, ethereum]);
};

export default useEagerConnect;
