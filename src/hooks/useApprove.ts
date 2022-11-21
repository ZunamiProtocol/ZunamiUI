import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import { approve, getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getZunamiAddress, isPLG } from '../utils/zunami';
import { log } from '../utils/logger';

const useApprove = () => {
    const { account, chainId, ethereum } = useWallet();
    const sushi = useSushi();
    let masterChefContract = getMasterChefContract(sushi);

    if (chainId === 56) {
        masterChefContract.defaultAccount = account;
        masterChefContract.options.address = getZunamiAddress(chainId);
    }

    if (isPLG(chainId) && masterChefContract) {
        masterChefContract.defaultAccount = account;
        masterChefContract.options.address = getZunamiAddress(chainId);
    }

    const handleApproveGZLP = useCallback(async () => {
        try {
            const tx = await approve(
                ethereum,
                getZunamiAddress(chainId),
                masterChefContract,
                account
            );

            log(`GZLP approval granted`);
            log(tx);
            return tx.hash;
        } catch (error: any) {
            log(`❗️ Error while approving GZLP: ${error.message}`)
            return false;
        }
    }, [account, masterChefContract, chainId, ethereum]);

    const handleApprove = useCallback(
        async (tokenAddress: string) => {
            try {
                const tx = await approve(ethereum, tokenAddress, masterChefContract, account);
                return tx;
            } catch (error: any) {
                log(`❗️ Error while approving token: ${error.message}`)
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
