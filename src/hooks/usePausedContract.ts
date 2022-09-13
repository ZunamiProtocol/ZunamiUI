import { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { log } from '../utils/logger';

const usePausedContract = (): boolean => {
    const [paused, setPaused] = useState(false);
    const { isConnected } = useWallet();
    const sushi = useSushi();

    useEffect(() => {
        if (!sushi) {
            return;
        }

        const getContractState = async () => {
            const contract = sushi.getEthContract()
            const status = await contract.methods.paused().call();
            log(`Contract paused: ${status}`);
            setPaused(status);
        }

        getContractState();
    }, [isConnected, sushi]);

    return paused;
};

export default usePausedContract;
