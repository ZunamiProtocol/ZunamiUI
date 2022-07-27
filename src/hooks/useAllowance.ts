import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import { getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getAllowance, getContract } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
} from '../utils/formatbalance';

const useAllowance = (tokenAddress: string) => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const { account, ethereum } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        const fetchAllowance = async () => {
            const allowance = await getAllowance(
                ethereum,
                tokenAddress,
                masterChefContract,
                // @ts-ignore
                account
            );
            setAllowance(new BigNumber(allowance));
        };

        if (account && masterChefContract) {
            fetchAllowance();
        }
        let refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, ethereum, tokenAddress, masterChefContract]);

    return allowance;
};

export default useAllowance;

export const useAllowanceStables = () => {
    const [allowance, setAllowance] = useState([BIG_ZERO, BIG_ZERO, BIG_ZERO]);
    const { account, ethereum, chainId } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        const fetchAllowanceStables = async () => {
            if (chainId === 1) {
                const allowanceDai = await getAllowance(
                    ethereum,
                    daiAddress,
                    masterChefContract,
                    // @ts-ignore
                    account
                );
                const allowanceUsdc = await getAllowance(
                    ethereum,
                    usdcAddress,
                    masterChefContract,
                    // @ts-ignore
                    account
                );
                const allowanceUsdt = await getAllowance(
                    ethereum,
                    usdtAddress,
                    masterChefContract,
                    // @ts-ignore
                    account
                );
                const data = [
                    new BigNumber(allowanceDai),
                    new BigNumber(allowanceUsdc),
                    new BigNumber(allowanceUsdt),
                ];
                // @ts-ignore
                setAllowance(data);
            } else {
                const lpContract = getContract(
                    sushi.bscContracts.bscMasterChef.currentProvider,
                    bscUsdtAddress
                );
                const allowanceUsdt = await lpContract.methods
                    .allowance(account, sushi.bscMasterChefAddress)
                    .call();
                setAllowance([BIG_ZERO, BIG_ZERO, new BigNumber(allowanceUsdt)]);
            }
        };

        if (account && masterChefContract) {
            fetchAllowanceStables();
        }
        let refreshInterval = setInterval(fetchAllowanceStables, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, ethereum, masterChefContract, chainId, sushi]);

    return allowance;
};
