import { Address, erc20ABI, useContractWrite, usePrepareContractWrite } from 'wagmi';

interface Coin {
    name: string;
    value: string;
}

type Coins = Array<Coin>;

const useStake = (coinAddress: Address, direct: boolean = false) => {
    //   const { data, isLoading, isSuccess, write } = useContractWrite({
    //       address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    //       abi: erc20ABI,
    //       functionName: 'feed',
    //   });
    // const { account, chainId } = useWallet();
    // const sushi = useSushi();
    // let zunamiContract = getMasterChefContract(sushi);

    // if (isBSC(chainId)) {
    //     zunamiContract = getMasterChefContract(sushi, chainId);
    // }

    // if (isPLG(chainId)) {
    //     zunamiContract = getMasterChefContract(sushi, chainId);
    // }

    // const dai = coins.filter((coin) => coin.name === 'DAI')[0]?.value;
    // const usdc = coins.filter((coin) => coin.name === 'USDC')[0]?.value;
    // const usdt = coins.filter((coin) => coin.name === 'USDT')[0]?.value;
    // const busd = coins.filter((coin) => coin.name === 'BUSD')[0]?.value;
    // const frax = coins.filter((coin) => coin.name === 'FRAX')[0]?.value;
    // const uzd = coins.filter((coin) => coin.name === 'UZD')[0]?.value;
    // const zeth = coins.filter((coin) => coin.name === 'ZETH')[0]?.value;

    // const handleStake = useCallback(async () => {
    //     log('Calling deposit...');

    //     if (chainId === 56 && busd && Number(usdt) === 0) {
    //         const contract = sushi.contracts.busdContract;
    //         contract.options.address = contractAddresses.busd[56];
    //         contract.defaultAccount = account;
    //         return await stakeBUSD(contract, account, busd);
    //     }

    //     if (chainId === 1 && frax && Number(frax) > 0) {
    //         const contract = sushi.contracts.fraxContract;
    //         contract.options.address = contractAddresses.frax[1];
    //         contract.defaultAccount = account;
    //         debugger;
    //         return await stakeFRAX(contract, account, frax);
    //     }

    //     if (chainId === 1 && uzd && Number(uzd) > 0) {
    //         const contract = sushi.contracts.apsContract;
    //         contract.options.address = contractAddresses.aps[1];
    //         contract.defaultAccount = account;
    //         return await stakeAPS(contract, account, uzd);
    //     }

    //     if (chainId === 1 && zeth && Number(zeth) > 0) {
    //         const contract = sushi.contracts.zethApsContract;
    //         contract.options.address = contractAddresses.zethAPS[1];
    //         contract.defaultAccount = account;
    //         return await stakeAPS(contract, account, zeth);
    //     }

    //     if (isPLG(chainId)) {
    //         const contract = sushi.contracts.polygonContract;
    //         contract.options.address = contractAddresses.zunami[137];
    //         contract.defaultAccount = account;
    //     }

    //     return await stake(zunamiContract, account, dai, usdc, usdt, direct, chainId);
    // }, [
    //     account,
    //     dai,
    //     usdc,
    //     usdt,
    //     busd,
    //     frax,
    //     uzd,
    //     zeth,
    //     zunamiContract,
    //     // sushi.contracts.busdContract, sushi.contracts.fraxContract, sushi.contracts.polygonContract,
    //     direct,
    //     chainId,
    // ]);

    return { onStake: () => {} };
};

export default useStake;
