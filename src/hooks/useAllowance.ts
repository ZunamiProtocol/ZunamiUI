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
    NULL_ADDRESS,
    sepDaiAddress,
    sepUsdcAddress,
    sepUsdtAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';
import { Address, sepolia, mainnet, useContractRead, erc20ABI } from 'wagmi';
import { getChainClient } from '../utils/zunami';

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

//             const allowanceUzd = await getAllowance(
//                 ethereum,
//                 contractAddresses.uzd[1],
//                 sushi.getApsContract(account),
//                 // @ts-ignore
//                 account
//             );

function getCoinAllowance(
    coinAddress: Address,
    account: Address,
    spender: Address,
    chainId: number = 1
) {
    return getChainClient(chainId).readContract({
        address: coinAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [
            account, //owner
            spender, // spender
        ],
    });
}

export const useAllowanceStables = (
    account: Address = NULL_ADDRESS,
    spender: Address,
    chainId: number = 1
) => {
    const [allowance, setAllowance] = useState([
        BIG_ZERO, // zunUSD
        BIG_ZERO, // zunETH
        BIG_ZERO, // DAI
        BIG_ZERO, // USDC
        BIG_ZERO, // USDT
        BIG_ZERO, // FRAX
    ]);

    useEffect(() => {
        const fetchAllowance = async () => {
            switch (chainId) {
                case mainnet.id:
                    break;
                case sepolia.id:
                    const result = [
                        BigInt('0'),
                        BigInt('0'),
                        await getCoinAllowance(sepDaiAddress, account, spender, chainId),
                        await getCoinAllowance(sepUsdcAddress, account, spender, chainId),
                        await getCoinAllowance(sepUsdtAddress, account, spender, chainId),
                        BigInt('0'),
                    ].map(
                        (allowance: BigInt, index: number) => new BigNumber(allowance.toString())
                    );

                    log(
                        `Allowance (sepolia): DAI - ${result[2].toString()}, USDC - ${result[3].toString()}, USDT - ${result[4].toString()}`
                    );

                    setAllowance(result);

                    break;
            }
        };

        if (account) {
            fetchAllowance();
        }

        let refreshInterval = setInterval(fetchAllowance, 60000);
        return () => clearInterval(refreshInterval);
    }, [account, spender, chainId]);

    return allowance;
};
