import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import { APPROVE_SUM, approve, getMasterChefContract } from '../sushi/utils';
import useSushi from './useSushi';
import { getZunamiAddress, isPLG } from '../utils/zunami';
import { log } from '../utils/logger';
import { fraxAddress } from '../utils/formatbalance';
import { contractAddresses } from '../sushi/lib/constants';

const useApproveUzd = () => {
    const { account, ethereum } = useWallet();
    const sushi = useSushi();
    let masterChefContract = getMasterChefContract(sushi);

    const handleApprove = useCallback(
        async (tokenAddress: string) => {
            try {
                let tx;
                debugger;

                tx = await approve(
                    ethereum,
                    contractAddresses.uzd[1],
                    sushi.getEthContract(),
                    account,
                    '10000000000000000000',
                    contractAddresses.aps[1]
                );

                log('UZD approved');

                return tx;
            } catch (error: any) {
                log(`❗️ Error while approving token: ${error.message}`);
                return false;
            }
        },
        [account, ethereum, masterChefContract]
    );

    return {
        onUzdApprove: handleApprove,
    };
};

export default useApproveUzd;
