import { useEffect, useState } from 'react';

const ETH_CHAIN_ID : number = 1;
const BSC_CHAIN_ID : number = 56;
const SUPPORTED_CHAIN_IDS : Array<number> = [ETH_CHAIN_ID, BSC_CHAIN_ID];

const useSupportedChain = () : boolean => {
    const [supportedChain, setSupportedChain] = useState(false);

    useEffect(() => {
        if (!window.ethereum) {
            setSupportedChain(true);
            return;
        }

        if (window.ethereum && ['0x1', '0x38'].indexOf(window.ethereum.chainId) === -1) {
            setSupportedChain(false);
        } else {
            setSupportedChain(true);
        }

        window.ethereum.on('networkChanged', (networkId: string) => {
            setSupportedChain(SUPPORTED_CHAIN_IDS.indexOf(parseInt(networkId, 10)) !== -1);
        });
    }, []);

    return supportedChain;
};

export default useSupportedChain;
