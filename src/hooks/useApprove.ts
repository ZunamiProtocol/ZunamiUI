import {useCallback} from 'react';
import {useWallet} from 'use-wallet';
import {approve, getMasterChefContract} from '../sushi/utils';
import useSushi from './useSushi';

const useApprove = () => {
    const {account, ethereum} = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    const handleApprove = useCallback(async (tokenAddress: string) => {
        try {
            const tx = await approve(ethereum, tokenAddress, masterChefContract, account);
            if (tx) {
                // gtag('event', 'Approve', {'Account': 'AC_' + account.toString()});
            }
            return tx;
        } catch (e) {
            return false;
        }
    }, [account, masterChefContract, ethereum]);

    return {onApprove: handleApprove};
};

export default useApprove;
