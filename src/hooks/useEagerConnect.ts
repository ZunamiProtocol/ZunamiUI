import { useEffect } from 'react';
import { LS_WALLET_TYPE_KEY } from '../components/WalletsModal/WalletsModal';

/**
 * Eager wallet connection from saved data in local storage
 * @param {string} account Account address
 * @param {function} connect Connect function
 * @param {object} ethereum
 */
const useEagerConnect = (account: string, connect: any, ethereum: any) => {
    useEffect(() => {
        const connectorId = window.localStorage.getItem(LS_WALLET_TYPE_KEY);

        if (!account && connectorId) {
            connect(connectorId || 'injected');
        }
    }, [account, connect, ethereum, window.ethereum?.chainId]);
};

export default useEagerConnect;
