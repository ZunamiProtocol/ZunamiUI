import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO, getBalanceNumber } from '../utils/formatbalance';
// import { useWallet } from 'use-wallet';
// import useSushi from './useSushi';
// import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { isETH } from '../utils/zunami';
import { contractAddresses } from '../sushi/lib/constants';

const useApsLpPrice = () => {
    // const { chainId, account } = useWallet();
    // const sushi = useSushi();
    // const masterChefContract = getMasterChefContract(sushi, chainId);

    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    // useEffect(() => {
    //     if (!account || !chainId || !masterChefContract || !sushi || !isETH(chainId)) {
    //         return;
    //     }

    //     const getLpPrice = async () => {
    //         const contract = sushi.getApsContract();
    //         contract.options.address = contractAddresses.aps[1];
    //         const value = await contract.methods.lpPrice().call();

    //         log(`🔄 APS LP Price: ${getBalanceNumber(value)} (${value.toString()})`);

    //         if (value) {
    //             setPrice(new BigNumber(value).dividedBy(new BigNumber(10).pow(18)));
    //         }
    //     };

    //     getLpPrice();

    //     let refreshInterval = setInterval(getLpPrice, 60000);
    //     return () => clearInterval(refreshInterval);
    // }, [account, chainId, masterChefContract, sushi]);

    return price;
};

export default useApsLpPrice;
