import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useSushi from './useSushi';
import { contractAddresses } from '../sushi/lib/constants';
import { useAccount } from 'wagmi';

const useTotalSupply = (address: string) => {
    const { address: account } = useAccount();
    const [totalSupply, setTotalSupply] = useState(new BigNumber(BIG_ZERO));
    const sushi = useSushi();

    useEffect(() => {
        if (!sushi || !account) {
            return;
        }

        const getTotalSupply = async () => {
            const contract =
                address === contractAddresses.uzd[1]
                    ? sushi.getUzdContract(account)
                    : sushi.getZETHContract(account);
            setTotalSupply(new BigNumber(await contract.methods.totalSupply().call()));
        };

        getTotalSupply();
    }, [account, sushi]);

    return totalSupply;
};

export default useTotalSupply;
