import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { log } from '../utils/logger';
import { useAccount, useNetwork, Address } from 'wagmi';
import { contractAddresses } from '../sushi/lib/constants';
import { readContract } from '@wagmi/core';
import zunAbi from '../actions/abi/Zunami.json';

const useLpPrice = (address: Address) => {
    const { chain } = useNetwork();
    const chainId = chain && chain.id;
    const { address: account } = useAccount();
    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        if (!account || !chainId) {
            return;
        }

        const getLpPrice = async () => {
            try {
                const value = await readContract({
                    address: address,
                    abi: zunAbi,
                    functionName: 'lpPrice',
                    args: [],
                });

                log(`lpPrice execution (${chainId}). Result: ${value}`);

                if (value) {
                    setPrice(new BigNumber(value.toString()).dividedBy(new BigNumber(10).pow(18)));
                }
            } catch (e) {
                log(
                    `Error while getting lpPrice of contract ${contractAddresses.zunami[1]}: ${e.message}`
                );
                debugger;
            }
        };

        getLpPrice();

        let refreshInterval = setInterval(getLpPrice, 60000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId]);

    return price;
};

export default useLpPrice;
