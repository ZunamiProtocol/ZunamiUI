import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';

const useStratLpPrice = () => {
    const { chainId, account } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi, chainId);
    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        if (!account || !chainId || !masterChefContract || !sushi) {
            return;
        }

        const getLpPrice = async () => {
            const contract = sushi.getEthContract();
            const wPid = await contract.methods.defaultWithdrawPid().call();
            const pool = await contract.methods.poolInfo(wPid).call();
            const strategyContract = sushi.getEthContract();
            strategyContract.options.address = pool.strategy;

            const strategyTotalHoldings = await strategyContract.methods.totalHoldings().call();

            const lpPrice = new BigNumber(strategyTotalHoldings).dividedBy(
                new BigNumber(pool.lpShares)
            );
            setPrice(lpPrice);
        };

        getLpPrice();

        let refreshInterval = setInterval(getLpPrice, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, masterChefContract, sushi]);

    return price;
};

export default useStratLpPrice;
