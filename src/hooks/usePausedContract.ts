import { useEffect, useState } from 'react';
import useSushi from './useSushi';
import { log } from '../utils/logger';
import { useAccount } from 'wagmi';

const usePausedContract = (): boolean => {
    const [paused, setPaused] = useState(false);
    const { isConnected } = useAccount();
    const sushi = useSushi();

    useEffect(() => {
        if (!sushi) {
            return;
        }

        const getContractState = async () => {
            const contract = sushi.getEthContract();
            const status = await contract.methods.paused().call();
            log(`Contract paused: ${status}`);
            setPaused(status);
        };

        getContractState();
    }, [isConnected, sushi]);

    return paused;
};

export default usePausedContract;
