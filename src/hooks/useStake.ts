import { useCallback } from 'react';
import useSushi from './useSushi';
import { useWallet } from 'use-wallet';
import { stake, getMasterChefContract, stakeBUSD } from '../sushi/utils';
import { contractAddresses } from '../sushi/lib/constants';

interface Coin {
    name: string;
    value: string;
}

type Coins = Array<Coin>;

const useStake = (coins: Coins, direct: boolean = false) => {
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    let zunamiContract = getMasterChefContract(sushi);

    if (chainId === 56) {
        zunamiContract = getMasterChefContract(sushi, chainId);
    }

    const dai = coins.filter(coin => coin.name === 'DAI')[0]?.value;
    const usdc = coins.filter(coin => coin.name === 'USDC')[0]?.value;
    const usdt = coins.filter(coin => coin.name === 'USDT')[0]?.value;
    const busd = coins.filter(coin => coin.name === 'BUSD')[0]?.value;

    const handleStake = useCallback(async () => {
        if (chainId === 56 && busd) {
            const contract = sushi.contracts.busdContract;
            contract.options.address = contractAddresses.busd[56];
            contract.defaultAccount = account;
            return await stakeBUSD(contract, account, busd);
        }

        return await stake(zunamiContract, account, dai, usdc, usdt, direct, chainId);
    }, [account, dai, usdc, usdt, busd, zunamiContract, direct, chainId]);

    return { onStake: handleStake };
};

export default useStake;
