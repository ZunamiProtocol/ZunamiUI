import { useEffect, useState } from 'react';

const ETH_CHAIN_ID = 1;
const BSC_CHAIN_ID = 56;

const useSupportedChain = () => {
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
            setSupportedChain([ETH_CHAIN_ID, BSC_CHAIN_ID].indexOf(parseInt(networkId, 10)) !== -1);
        });
    }, []);

    return supportedChain;
};

export default useSupportedChain;
