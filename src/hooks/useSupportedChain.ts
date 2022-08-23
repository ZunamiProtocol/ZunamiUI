import { useEffect, useState } from 'react';

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
            setSupportedChain(['1', '56'].indexOf(networkId) !== -1);
        });
    }, []);

    return supportedChain;
};

export default useSupportedChain;
