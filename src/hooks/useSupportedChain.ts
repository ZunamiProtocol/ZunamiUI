import { useEffect, useState } from 'react';
import { log } from '../utils/logger';
import { useWallet } from 'use-wallet';

const ETH_CHAIN_ID: number = 1;
const BSC_CHAIN_ID: number = 56;
const PLG_CHAIN_ID: number = 137;
const SUPPORTED_CHAIN_IDS: Array<number> = [ETH_CHAIN_ID, BSC_CHAIN_ID, PLG_CHAIN_ID];

const useSupportedChain = (): boolean => {
    const [supportedChain, setSupportedChain] = useState(true);
    const { isConnected, account, ethereum } = useWallet();

    useEffect(() => {
        const chainId = window.ethereum?.chainId;

        if (!account) {
            return false;
        }

        if (window.ethereum && SUPPORTED_CHAIN_IDS.indexOf(parseInt(chainId, 16)) === -1) {
            log(`Unsupported chain detected: ${chainId}`);
            setSupportedChain(false);
        } else {
            setSupportedChain(true);
        }

        log(`Connected to: ${chainId}`);

        if (!window.ethereum) {
            return;
        }

        window.ethereum.on('networkChanged', (networkId: string) => {
            log(`Network changed to: ${networkId}`);
            setSupportedChain(SUPPORTED_CHAIN_IDS.indexOf(parseInt(networkId, 10)) !== -1);
        });
    }, [isConnected, account, ethereum]);

    return supportedChain;
};

export default useSupportedChain;
