import { useCallback } from 'react';
import useSushi from './useSushi';
import { useWallet } from 'use-wallet';
import { stake, getMasterChefContract, stakeBUSD } from '../sushi/utils';
import { contractAddresses } from '../sushi/lib/constants';
import { isBSC, isPLG } from '../utils/zunami';

interface Coin {
    name: string;
    value: string;
}

type Coins = Array<Coin>;

const useStake = (coins: Coins, direct: boolean = false) => {
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    let zunamiContract = getMasterChefContract(sushi);

    if (isBSC(chainId)) {
        zunamiContract = getMasterChefContract(sushi, chainId);
    }

    if (isPLG(chainId)) {
        zunamiContract = getMasterChefContract(sushi, chainId);
    }

    const dai = coins.filter((coin) => coin.name === 'DAI')[0]?.value;
    const usdc = coins.filter((coin) => coin.name === 'USDC')[0]?.value;
    const usdt = coins.filter((coin) => coin.name === 'USDT')[0]?.value;
    const busd = coins.filter((coin) => coin.name === 'BUSD')[0]?.value;

    const handleStake = useCallback(async () => {
        if (chainId === 56 && busd && Number(usdt) === 0) {
            const contract = sushi.contracts.busdContract;
            contract.options.address = contractAddresses.busd[56];
            contract.defaultAccount = account;
            return await stakeBUSD(contract, account, busd);
        }

        if (isPLG(chainId)) {
            const contract = sushi.contracts.polygonContract;
            contract.options.address = contractAddresses.zunami[137];
            contract.defaultAccount = account;
        }

        return await stake(zunamiContract, account, dai, usdc, usdt, direct, chainId);
    }, [account, dai, usdc, usdt, busd, zunamiContract, direct, chainId]);

    return { onStake: handleStake };
};

export default useStake;
