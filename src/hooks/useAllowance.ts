import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
// import { useWallet } from 'use-wallet';
import { getMasterChefContract } from '../sushi/utils';
// import useSushi from './useSushi';
import { getAllowance, getContract } from '../utils/erc20';
import {
    BIG_ZERO,
    daiAddress,
    usdcAddress,
    usdtAddress,
    fraxAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';
import { Address, useContractRead } from 'wagmi';

const useAllowance = (contractAddress: Address, abi: any, owner: Address, spender: Address) => {
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const { refetch, isRefetching } = useContractRead({
        address: contractAddress,
        abi: abi,
        functionName: 'allowance',
        args: [owner, spender],
        onError(error) {
            log(`[${contractAddress}]->allowance('${owner}', '${spender}') - ERROR: ${error}`);
            log(JSON.stringify(error));
            setAllowance(BIG_ZERO);
        },
        onSuccess(value: BigInt) {
            log(`[${contractAddress}]->allowance('${owner}', '${spender}'). Result: ${value})`);

            setAllowance(new BigNumber(value.toString()));

            // setTimeout(() => {
            //     refetch();
            //     log(`[SMART] balanceOf (contract ${contractAddress}) for address ${account}`);
            // }, 5000);
        },
    });
    // const { account, ethereum } = useWallet();
    // const sushi = useSushi();
    // const masterChefContract = contract ? contract : getMasterChefContract(sushi);

    // useEffect(() => {
    //     const fetchAllowance = async () => {
    //         const allowance = await getAllowance(
    //             ethereum,
    //             tokenAddress,
    //             masterChefContract,
    //             // @ts-ignore
    //             account
    //         );
    //         setAllowance(new BigNumber(allowance));
    //     };

    //     if (account && masterChefContract) {
    //         fetchAllowance();
    //     }
    //     let refreshInterval = setInterval(fetchAllowance, 10000);
    //     return () => clearInterval(refreshInterval);
    // }, [account, ethereum, tokenAddress, masterChefContract]);

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
        BIG_ZERO, // UZD
        BIG_ZERO, // ZETH
        BIG_ZERO, // ETHZAPSLP
        BIG_ZERO, // ZAPSLP
    ]);

    // const { account, ethereum, chainId } = useWallet();
    // const sushi = useSushi();

    // useEffect(() => {
    //     const masterChefContract = getMasterChefContract(sushi);

    //     const fetchAllowanceStables = async () => {
    //         if (!account) {
    //             return;
    //         }

    //         if (chainId === 1) {
    //             masterChefContract.options.address = contractAddresses.zunami[1];

    //             const allowanceUzd = await getAllowance(
    //                 ethereum,
    //                 contractAddresses.uzd[1],
    //                 sushi.getApsContract(account),
    //                 // @ts-ignore
    //                 account
    //             );

    //             const allowanceZeth = await getAllowance(
    //                 ethereum,
    //                 contractAddresses.zeth[1],
    //                 sushi.getZethApsContract(account),
    //                 // @ts-ignore
    //                 account
    //             );

    //             const allowanceEthZAPSLP = await getAllowance(
    //                 ethereum,
    //                 contractAddresses.zethAPS[1],
    //                 sushi.getZethApsContract(account),
    //                 // @ts-ignore
    //                 account
    //             );

    //             const allowanceZAPSLP = await getAllowance(
    //                 ethereum,
    //                 contractAddresses.aps[1],
    //                 sushi.getApsContract(account),
    //                 // @ts-ignore
    //                 account
    //             );

    //             const data = [
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 new BigNumber(allowanceUzd),
    //                 new BigNumber(allowanceZeth),
    //                 new BigNumber(allowanceEthZAPSLP),
    //                 new BigNumber(allowanceZAPSLP),
    //             ];
    //             // @ts-ignore
    //             setAllowance(data);

    //             log(`Allowance UZD: ${allowanceUzd}`);
    //             log(`Allowance ZETH: ${allowanceZeth}`);
    //             log(`Allowance ZAPSLP: ${allowanceZAPSLP}`);
    //             log(`Allowance ethZAPSLP: ${allowanceEthZAPSLP}`);
    //         } else if (isBSC(chainId)) {
    //             // const lpContract = getContract(
    //             //     sushi.bscContracts.bscMasterChef.currentProvider,
    //             //     bscUsdtAddress
    //             // );

    //             // const allowanceUsdt = await lpContract.methods
    //             //     .allowance(account, sushi.bscMasterChefAddress)
    //             //     .call();

    //             // const busdContract = getContract(
    //             //     sushi.bscContracts.bscMasterChef.currentProvider,
    //             //     bscUsdtAddress
    //             // );

    //             // busdContract.options.address = busdAddress;

    //             // const allowanceBUSD = await busdContract.methods
    //             //     .allowance(account, contractAddresses.busd[56])
    //             //     .call();

    //             // log(`BSC USDT allowance for address (${account}) is: ${allowanceUsdt}`);
    //             // log(`BSC BUSD allowance for address (${account}) is: ${allowanceBUSD}`);

    //             setAllowance([
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //             ]);
    //         } else if (isPLG(chainId)) {
    //             // const lpContract = getContract(
    //             //     sushi.plgContracts.polygonContract.currentProvider,
    //             //     plgUsdtAddress
    //             // );

    //             // const allowanceUsdt = await lpContract.methods
    //             //     .allowance(account, sushi.polygonMasterChefAddress)
    //             //     .call();

    //             // log(`PLG USDT allowance for address (${account}) is: ${allowanceUsdt}`);

    //             setAllowance([
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //                 BIG_ZERO,
    //             ]);
    //         }
    //     };

    //     if (account && masterChefContract) {
    //         fetchAllowanceStables();
    //     }
    //     let refreshInterval = setInterval(fetchAllowanceStables, 10000);
    //     return () => clearInterval(refreshInterval);
    // }, [account, ethereum, chainId, sushi]);

    return allowance;
};
