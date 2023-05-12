import { useState, useEffect } from 'react';
import { getTestnetStatusUrl } from '../api/api';
import { useWallet } from 'use-wallet';

const useTestnetStatus = async () => {
    const { account } = useWallet();
    const [testnetStatus, setTestnetStatus] = useState(false);

    useEffect(() => {
        async function getStatus() {
            if (!account) {
                return false;
            }

            try {
                const response = await fetch(getTestnetStatusUrl(account));
                const data = await response.json();
                setTestnetStatus(data);
            } catch (error) {
                setTestnetStatus(false);
            }
        }

        getStatus();
    }, [account]);

    return testnetStatus;
};

export default useTestnetStatus;
