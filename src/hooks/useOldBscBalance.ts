import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import Web3 from 'web3';
import bscAbi from '../actions/abi/zunami_bsc.json';
import { isETH } from '../utils/zunami';
import { log } from '../utils/logger';
import { contractAddresses } from '../sushi/lib/constants';

async function getDeprecatedBalance(address: string, account: string) : Promise<string> {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com'));
    const contract = new web3.eth.Contract(bscAbi);
    contract.options.from = account;
    contract.options.address = address;

    const value = await contract.methods.balanceOf(account).call();
    log(`Deprecated BSC contract (${address}) balance execution. Result: ${value}`);
    return value;
}

const useOldBscBalance = () => {
    const [balance, setBalance] = useState([
        new BigNumber(BIG_ZERO), // 1.0
        new BigNumber(BIG_ZERO), // 1.1
    ]);

    const { chainId, account } = useWallet();
    const isEth = isETH(chainId);
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        if (!account || !chainId || !masterChefContract) {
            setBalance([
                BIG_ZERO,
                BIG_ZERO
            ]);
            return;
        }

        const getBalance = async () => {
            setBalance([
                new BigNumber(await getDeprecatedBalance(contractAddresses.deprecated.v_1_0_bsc, account)),
                new BigNumber(await getDeprecatedBalance(contractAddresses.deprecated.v_1_1_bsc, account)),
            ]);
        };

        getBalance();
    }, [account, chainId, isEth, masterChefContract]);

    return balance;
};

export default useOldBscBalance;
