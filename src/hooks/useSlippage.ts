import BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import converterABI from '../actions/abi/zunami_busd_converter.json';
import Web3 from 'web3';
import { log } from '../utils/logger';
import { isBSC } from '../utils/zunami';

export const useSlippage = () => {
    const { chainId } = useWallet();
    const sushi = useSushi();
    

    const fetchSlippage = useCallback(
        async (busd: string) => {
            if (!isBSC(chainId)) {
                return;
            }

            const web3 = new Web3(sushi.getBscProvider());
            const contract = new web3.eth.Contract(converterABI);
            contract.options.address = '0xbDA7FAb835a8202B89a9C827dbA0224703e90CC9';
            const value = new BigNumber(busd).multipliedBy(new BigNumber(10).pow(18)).toString();

            log(`ZUN-BUSD-CONVERTER: Executing getAmountOut(${value})`);

            return await contract.methods.getAmountOut(value).call();
        },
        [chainId, sushi]
    );

    return {
        getSlippage: fetchSlippage,
    };
};
