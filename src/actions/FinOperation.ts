import {ethers} from 'ethers';
import {isWalletConnected} from './MetamaskActions';

import zunami from './abi/Zunami.json';
import erc20 from './abi/erc20.abi.json';

const provider = new ethers.providers.Web3Provider((window as any).ethereum);
const signer = provider.getSigner();

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

// TODO replace this fake addr
const zunamiAddress = '0x3cBF9B0b68B2f7676E8eC6eB35a411A19748fb3e';

const daiContract = new ethers.Contract(daiAddress, erc20, signer);
const usdcContract = new ethers.Contract(usdcAddress, erc20, signer);
const usdtContract = new ethers.Contract(usdtAddress, erc20, signer);
const zunamiContract = new ethers.Contract(zunamiAddress, zunami, signer);

export const deposit = async (dai: string, usdc: string, usdt: string): Promise<boolean> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
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

    const assets = [parseInt(dai), parseInt(usdc), parseInt(usdt)];
    const lpShares: number = zunamiContract.balanceOf(await signer.getAddress());

    zunamiContract.withdraw(lpShares, assets);

    return true;
};
