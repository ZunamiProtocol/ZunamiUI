import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import { approve, getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getZunamiAddress } from '../utils/zunami';
import { bscUsdtAddress } from '../utils/formatbalance';

const useApprove = () => {
    const { account, chainId, ethereum } = useWallet();
    const sushi = useSushi();
    let masterChefContract = getMasterChefContract(sushi);

    if (chainId !== 1) {
        masterChefContract = sushi.bscContracts.bscMasterChef;
        masterChefContract.options.address = getZunamiAddress(chainId);
    }

    const handleApproveGZLP = useCallback(async () => {
        try {
            debugger;
            const tx = await approve(ethereum, bscUsdtAddress, masterChefContract, account);

            console.log(`GZLP approval granted`);
            console.log(tx);
            return tx.hash;
        } catch (e) {
            debugger;
            return false;
        }
    }, [account, ethereum, masterChefContract]);

    const handleApprove = useCallback(
        async (tokenAddress: string) => {
            try {
                const tx = await approve(ethereum, tokenAddress, masterChefContract, account);
                return tx;
            } catch (e) {
                debugger;
                return false;
            }
        },
        [account, ethereum, masterChefContract]
    );

    return {
        onApprove: handleApprove,
        onGZLPApprove: handleApproveGZLP,
    };
};

export default useApprove;

// import { useCallback } from 'react';
// import { useChain } from 'react-moralis';
// // import { getZunamiAddress } from '../utils/zunami';
// // import ethAbi from '../actions/abi/Zunami.json';
// // import bscAbi from '../actions/abi/zunami_bsc.json';
// // import { Moralis } from 'moralis';

// const useApprove = () => {
//     // const { account, chainId, chain } = useChain();

//     const handleApproveGZLP = useCallback(async () => {
//         try {
//             // const tx = await Moralis.executeFunction({
//             //     contractAddress: getZunamiAddress(chainId),
//             //     functionName: "increaseAllowance",
//             //     abi: bscAbi,
//             //     params: {
//             //         spender: getZunamiAddress(chainId),
//             //         addedValue: '9389319443248196642',
//             //     },
//             // });
//             // console.log(`GZLP approval granted`);
//             // console.log(tx);
//             // return tx.hash;
//         } catch (e) {
//             debugger;
//             return false;
//         }
//     }, []);

//     const handleApprove = useCallback(async (tokenAddress: string) => {
//         try {
//             // const tx = await Moralis.executeFunction({
//             //     contractAddress: tokenAddress,
//             //     functionName: "approve",
//             //     abi: chain?.shortName === 'bnb' ? bscAbi : ethAbi,
//             //     params: {
//             //         spender: getZunamiAddress(chainId),
//             //         owner: account,
//             //         amount: '1000000000000000000000000000'
//             //     },
//             // });
//             // console.log(`Coin approval granted`);
//             // console.log(tx);
//             // return tx.hash;
//         } catch (e) {
//             debugger;
//             return false;
//         }
//     }, []);

//     return {
//         onApprove: handleApprove,
//         onGZLPApprove: handleApproveGZLP,
//     };
// };

// export default useApprove;
