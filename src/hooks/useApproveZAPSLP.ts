import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import { approve } from '../sushi/utils';
import useSushi from './useSushi';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

const useApproveZAPSLP = () => {
    const { account, ethereum } = useWallet();
    const sushi = useSushi();

    const handleApprove = useCallback(
        async (tokenAddress: string) => {
            try {
                let tx;

                tx = await approve(
                    ethereum,
                    contractAddresses.zethAPS[1], // whos granted
                    sushi.getEthContract(),
                    account,
                    '10000000000000000000',
                    contractAddresses.zethAPS[1] // who grants
                );

                log('ZAPSLP approved');

                return tx;
            } catch (error: any) {
                log(`❗️ Error while approving token: ${error.message}`);
                return false;
            }
        },
        [account, ethereum, sushi]
    );

    return {
        onZAPSLPApprove: handleApprove,
    };
};

export default useApproveZAPSLP;
