import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getLpPrice } from '../utils/erc20';

const useLpPrice = (): BigNumber => {
    const [price, setPrice] = useState(new BigNumber(-1));
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        const fetchLpPrice = async () => {
            const allowance = await getLpPrice(masterChefContract);
            setPrice(new BigNumber(allowance).dividedBy(new BigNumber(10).pow(18)));
        };

        if (masterChefContract) {
            fetchLpPrice();
        }
        let refreshInterval = setInterval(fetchLpPrice, 10000);
        return () => clearInterval(refreshInterval);
    }, [masterChefContract]);

    return price;
};

export default useLpPrice;
