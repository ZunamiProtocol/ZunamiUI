import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { BIG_ZERO } from '../utils/formatbalance';
// import { getZunamiAddress } from '../utils/zunami';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { getContract } from '../utils/erc20';
import Web3 from 'web3';
import ethAbi from '../actions/abi/Zunami.json';

const useLpPrice = () => {
    const { chainId, account } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi, chainId);

    const [price, setPrice] = useState(new BigNumber(BIG_ZERO));

    useEffect(() => {
        if (!account || !chainId || !masterChefContract || !sushi) {
            return;
        }

        const getLpPrice = async () => {
            // console.log(sushi);

            // const lpContract = getContract(
            //     sushi.ethContracts.ethMasterChef.currentProvider,
            //     sushi.masterChefAddress
            // );
            // console.log(lpContract.methods);
            // const value = await lpContract.methods.lpPrice().call();

            const ethProvider = new Web3.providers.HttpProvider(
                'https://eth-mainnet.alchemyapi.io/v2/Yh5zNTgJkqrOIqLtfkZBGIPecNPDQ1ON',
                {
                    autoGasMultiplier: 1.5,
                    defaultAccount: account,
                    defaultConfirmations: 1,
                    defaultGas: '6000000',
                    defaultGasPrice: '1000000000000',
                    ethereumNodeTimeout: 10000,
                    testing: false,
                }
            );

            const web3 = new Web3(ethProvider);
            const contract = new web3.eth.Contract(ethAbi);
            contract.options.from = account;
            contract.options.address = '0x2ffCC661011beC72e1A9524E12060983E74D14ce';

            const value = await contract.methods.lpPrice().call();
            console.log(`lpPrice execution (${chainId}). Result: ${value}`);

            if (value) {
                setPrice(new BigNumber(value).dividedBy(new BigNumber(10).pow(18)));
            }
        };

        getLpPrice();
    }, [account, chainId, masterChefContract, sushi]);

    return price;
};

export default useLpPrice;
