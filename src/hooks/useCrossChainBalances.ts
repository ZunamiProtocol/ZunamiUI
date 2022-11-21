import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { log } from '../utils/logger';

const useCrossChainBalances = (lpPrice: BigNumber) => {
    const { account } = useWallet();
    const sushi = useSushi();

    const [balances, setBalances] = useState([
        {
            chainId: 'eth',
            value: new BigNumber(BIG_ZERO),
        },
        {
            chainId: 'bsc',
            value: new BigNumber(BIG_ZERO),
        },
        {
            chainId: 'plg',
            value: new BigNumber(BIG_ZERO),
        },
    ]);

    useEffect(() => {
        if (!account || lpPrice.toNumber() === 0 || !sushi) {
            return;
        }

        const getBalances = async () => {
            const ethContract = sushi.getEthContract(account);
            const ethBalance = await ethContract.methods.balanceOf(account).call();
            log(`Raw ETH balance is: ${ethBalance}`);
            const bscBalance = await sushi.bscContracts.bscMasterChef.methods
                .balanceOf(account)
                .call();
            log(`Raw BSC balance is: ${bscBalance}`);

            const plgBalance = await sushi.plgContracts.polygonContract.methods
                .balanceOf(account)
                .call();

            log(`Raw PLG balance is: ${bscBalance}`);

            setBalances([
                {
                    chainId: 'eth',
                    value: new BigNumber(ethBalance),
                },
                {
                    chainId: 'bsc',
                    value: new BigNumber(bscBalance),
                },
                {
                    chainId: 'plg',
                    value: new BigNumber(plgBalance),
                },
            ]);
        };

        getBalances();
    }, [account, lpPrice, sushi]);

    return balances;
};

export default useCrossChainBalances;
