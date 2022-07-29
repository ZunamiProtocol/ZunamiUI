import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
import useWallet from './useWallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import Web3 from 'web3';
import bscAbi from '../actions/abi/zunami_bsc.json';
import { isBSC, isETH } from '../utils/zunami';

const useOldBscBalance = () => {
    const [balance, setBalance] = useState(new BigNumber(BIG_ZERO));
    const { chainId, account } = useWallet();
    const isEth = isETH(chainId);
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);

    useEffect(() => {
        if (!account || !chainId || !masterChefContract) {
            setBalance(BIG_ZERO);
            return;
        }

        const getBalance = async () => {
            const web3 = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com'));
            const contract = new web3.eth.Contract(bscAbi);
            contract.options.from = account;
            contract.options.address = '0x02a228D826Cbb1C0E8765A6DB6E7AB64EAA80BFD';

            const value = await contract.methods.balanceOf(account).call();
            console.log(`OLD BSC balance execution (chain ${chainId}). Result: ${value}`);

            if (value) {
                setBalance(new BigNumber(value));
            }
        };

        getBalance();
    }, [account, chainId, isEth, masterChefContract]);

    return balance;
};

export default useOldBscBalance;
