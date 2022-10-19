import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { log } from '../utils/logger';
import { isETH } from '../utils/zunami';
import { contractAddresses } from '../sushi/lib/constants';

const useUzdLpPrice = () => {
    const { chainId, account } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi, chainId);

    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        if (!account || !chainId || !masterChefContract || !sushi || !isETH(chainId)) {
            return;
        }

        const getLpPrice = async () => {
            const contract = sushi.getUzdContract();
            const value = await contract.methods.assetPriceCached().call();

            log(`UZD lpPrice execution (${chainId}). Result: ${value}`);

            if (value) {
                setPrice(new BigNumber(value).dividedBy(new BigNumber(10).pow(18)));
            }
        };

        getLpPrice();

        let refreshInterval = setInterval(getLpPrice, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, masterChefContract, sushi]);

    return price;
};

export default useUzdLpPrice;
