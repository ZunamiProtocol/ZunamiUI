import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
// import useWallet from './useWallet';
// import useSushi from './useSushi';
import { contractAddresses } from '../sushi/lib/constants';

const useTotalSupply = (address: string) => {
    // const { account } = useWallet();
    const [totalSupply, setTotalSupply] = useState(new BigNumber(BIG_ZERO));
    // const sushi = useSushi();

    // useEffect(() => {
    //     if (!sushi || !account) {
    //         return;
    //     }

    //     const getTotalSupply = async () => {
    //         const contract =
    //             address === contractAddresses.uzd[1]
    //                 ? sushi.getUzdContract(account)
    //                 : sushi.getZETHContract(account);
    //         setTotalSupply(new BigNumber(await contract.methods.totalSupply().call()));
    //     };

    //     getTotalSupply();
    // }, [account, sushi]);

    return totalSupply;
};

export default useTotalSupply;
