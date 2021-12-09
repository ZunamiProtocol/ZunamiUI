import {ethers} from 'ethers';
import {isWalletConnected} from './MetamaskActions';

import zunami from './abi/Zunami.json';
import erc20 from './abi/erc20.abi.json';

const ethereum = (window as any).ethereum;
let provider : ethers.providers.Web3Provider;
let signer : any;
let daiContract : ethers.Contract;
let usdcContract : ethers.Contract;
let usdtContract : ethers.Contract;
let zunamiContract : ethers.Contract;

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

// TODO replace this fake addr
const zunamiAddress = '0x3cBF9B0b68B2f7676E8eC6eB35a411A19748fb3e';

if (ethereum) {
    provider = new ethers.providers.Web3Provider(ethereum);
    signer = provider.getSigner();
    daiContract = new ethers.Contract(daiAddress, erc20, signer);
    usdcContract = new ethers.Contract(usdcAddress, erc20, signer);
    usdtContract = new ethers.Contract(usdtAddress, erc20, signer);
    zunamiContract = new ethers.Contract(zunamiAddress, zunami, signer);
}

export const isMetaMaskAvailable = () : Boolean => {
    return Boolean((window as any).ethereum);
}

export const deposit = async (dai: string, usdc: string, usdt: string): Promise<boolean> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return false;
    }

    if (!isMetaMaskAvailable()) {
        console.log('No MetaMask presented');
        return false;
    }

    const assets = [parseInt(dai), parseInt(usdc), parseInt(usdt)];

    await daiContract.approve(zunamiAddress, dai);
    await usdcContract.approve(zunamiAddress, usdc);
    await usdtContract.approve(zunamiAddress, usdt);

    zunamiContract.deposit(assets);

    return true;
};

export const withdraw = async (dai: string, usdc: string, usdt: string): Promise<boolean> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return false;
    }

    if (!isMetaMaskAvailable()) {
        console.log('No MetaMask presented');
        return false;
    }

    const assets = [parseInt(dai), parseInt(usdc), parseInt(usdt)];
    const lpShares: number = zunamiContract.balanceOf(await signer.getAddress());

    zunamiContract.withdraw(lpShares, assets);

    return true;
};
