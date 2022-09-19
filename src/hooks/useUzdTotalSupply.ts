import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';

const useUzdTotalSupply = () => {
    const { account } = useWallet();
    const [totalSupply, setTotalSupply] = useState(new BigNumber(BIG_ZERO));
    const sushi = useSushi();

    useEffect(() => {
        if (!sushi || !account) {
            return;
        }

        const getTotalSupply = async () => {
            const contract = sushi.getUzdContract(account);
            setTotalSupply(new BigNumber(await contract.methods.totalSupply().call()));
        };

        getTotalSupply();
    }, [account, sushi]);

    return totalSupply;
};

export default useUzdTotalSupply;
