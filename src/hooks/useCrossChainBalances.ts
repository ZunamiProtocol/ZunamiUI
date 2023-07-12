import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useSushi from './useSushi';
import { log } from '../utils/logger';
import { useAccount } from 'wagmi';

const useCrossChainBalances = (lpPrice: BigNumber) => {
    const { address: account } = useAccount();
    const sushi = useSushi();

    const [balances, setBalances] = useState([
        {
            chainId: 'eth',
            key: '0x1',
            value: BIG_ZERO,
        },
        {
            chainId: 'bsc',
            key: '0x38',
            value: BIG_ZERO,
        },
        {
            chainId: 'plg',
            key: '0x89',
            value: BIG_ZERO,
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

            if (ethBalance === '0' && bscBalance === '0' && plgBalance === '0') {
                return;
            }

            const result = [
                {
                    chainId: 'eth',
                    key: '0x1',
                    value: new BigNumber(ethBalance),
                },
                {
                    chainId: 'bsc',
                    key: '0x38',
                    value: new BigNumber(bscBalance),
                },
                {
                    chainId: 'plg',
                    key: '0x89',
                    value: new BigNumber(plgBalance),
                },
            ];

            log(`Crosschain balances: ${result}`);

            setBalances(result);
        };

        getBalances();
    }, [account, lpPrice, sushi]);

    return balances;
};

export default useCrossChainBalances;
