import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getAllowance, getContract } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
    fraxAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';
import { isBSC, isPLG } from '../utils/zunami';
import { Address, useAccount, useNetwork } from 'wagmi';

const useAllowance = (tokenAddress: Address, contract: Contract) => {
    const { address: account } = useAccount();
    const [allowance, setAllowance] = useState(BIG_ZERO);

    const sushi = useSushi();
    const masterChefContract = contract ? contract : getMasterChefContract(sushi);

    useEffect(() => {
        const fetchAllowance = async () => {
            const allowance = await getAllowance(
                tokenAddress,
                masterChefContract,
                // @ts-ignore
                account
            );
            setAllowance(new BigNumber(allowance.toString()));
        };

        if (account && masterChefContract) {
            fetchAllowance();
        }
        let refreshInterval = setInterval(fetchAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, tokenAddress, masterChefContract]);

    return allowance;
};

export default useAllowance;

export const useAllowanceStables = () => {
    const [allowance, setAllowance] = useState([
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
        BIG_ZERO,
    ]);

    const { chain } = useNetwork();
    const chainId = chain && chain.id;
    const { address: account } = useAccount();

    const sushi = useSushi();

    useEffect(() => {
        const masterChefContract = getMasterChefContract(sushi);

        const fetchAllowanceStables = async () => {
            if (!account) {
                return;
            }

            if (chainId === 1) {
                masterChefContract.options.address = contractAddresses.zunami[1];

                const allowanceDai = await getAllowance(daiAddress, masterChefContract, account);
                const allowanceUsdc = await getAllowance(usdcAddress, masterChefContract, account);
                const allowanceUsdt = await getAllowance(usdtAddress, masterChefContract, account);
                // debugger;
                const allowanceFrax = await getAllowance(
                    fraxAddress,
                    sushi.getFraxContract(account),
                    account
                );
                const allowanceUzd = await getAllowance(
                    contractAddresses.uzd[1],
                    sushi.getApsContract(account),
                    account
                );
                const data = [
                    new BigNumber(allowanceDai.toString()),
                    new BigNumber(allowanceUsdc.toString()),
                    new BigNumber(allowanceUsdt.toString()),
                    BIG_ZERO,
                    new BigNumber(allowanceFrax.toString()),
                    new BigNumber(allowanceUzd.toString()),
                ];
                // @ts-ignore
                setAllowance(data);
                log(`Allowance DAI: ${allowanceDai}`);
                log(`Allowance USDC: ${allowanceUsdc}`);
                log(`Allowance USDT: ${allowanceUsdt}`);
                log(`Allowance FRAX: ${allowanceFrax}`);
                log(`Allowance UZD: ${allowanceUzd}`);
            } else if (isBSC(chainId)) {
                const lpContract = getContract(
                    sushi.bscContracts.bscMasterChef.currentProvider,
                    bscUsdtAddress
                );

                const allowanceUsdt = await lpContract.methods
                    .allowance(account, sushi.bscMasterChefAddress)
                    .call();

                const busdContract = getContract(
                    sushi.bscContracts.bscMasterChef.currentProvider,
                    bscUsdtAddress
                );

                busdContract.options.address = busdAddress;

                const allowanceBUSD = await busdContract.methods
                    .allowance(account, contractAddresses.busd[56])
                    .call();

                log(`BSC USDT allowance for address (${account}) is: ${allowanceUsdt}`);
                log(`BSC BUSD allowance for address (${account}) is: ${allowanceBUSD}`);

                setAllowance([
                    BIG_ZERO,
                    BIG_ZERO,
                    new BigNumber(allowanceUsdt),
                    new BigNumber(allowanceBUSD),
                    BIG_ZERO,
                    BIG_ZERO,
                ]);
            } else if (isPLG(chainId)) {
                const lpContract = getContract(
                    sushi.plgContracts.polygonContract.currentProvider,
                    plgUsdtAddress
                );

                const allowanceUsdt = await lpContract.methods
                    .allowance(account, sushi.polygonMasterChefAddress)
                    .call();

                log(`PLG USDT allowance for address (${account}) is: ${allowanceUsdt}`);

                setAllowance([
                    BIG_ZERO,
                    BIG_ZERO,
                    new BigNumber(allowanceUsdt),
                    BIG_ZERO,
                    BIG_ZERO,
                    BIG_ZERO,
                ]);
            }
        };

        if (account && masterChefContract) {
            fetchAllowanceStables();
        }
        let refreshInterval = setInterval(fetchAllowanceStables, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId, sushi]);

    return allowance;
};
