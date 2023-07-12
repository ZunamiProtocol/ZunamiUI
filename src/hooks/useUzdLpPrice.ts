import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { log } from '../utils/logger';
import { isETH } from '../utils/zunami';
import { useAccount, useNetwork, Address } from 'wagmi';
import { readContract } from '@wagmi/core';
import { contractAddresses } from '../sushi/lib/constants';
import uzdAbi from '../actions/abi/zunami_uzd.json';

const useUzdLpPrice = () => {
    const { chain } = useNetwork();
    const { address: account } = useAccount();
    const chainId = chain && chain.id;
    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        if (!account || !chainId || !isETH(chainId)) {
            return;
        }

        const getLpPrice = async () => {
            try {
                const value = await readContract({
                    address: contractAddresses.uzd[1],
                    abi: uzdAbi,
                    functionName: 'assetPriceCached',
                    args: [],
                });

                log(`UZD lpPrice execution (${chainId}). Result: ${value}`);

                if (value) {
                    setPrice(new BigNumber(value.toString()).dividedBy(new BigNumber(10).pow(18)));
                }
            } catch (e) {
                log(`Error while getting assetPriceCached() for UZD: ${e.message}`);
            }
        };

        getLpPrice();

        let refreshInterval = setInterval(getLpPrice, 5000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId]);

    return price;
};

export default useUzdLpPrice;
