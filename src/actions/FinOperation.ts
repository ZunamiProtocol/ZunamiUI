import { ethers} from 'ethers';
import {isWalletConnected} from './MetamaskActions';
import BigNumber from 'bignumber.js'

import zunami from './abi/Zunami.json';
import erc20 from './abi/erc20.abi.json';
import {useCallback, useEffect, useState} from "react";
import {DAI_TOKEN_DECIMAL, USDT_TOKEN_DECIMAL} from "../utils/formatbalance";

const provider = new ethers.providers.Web3Provider((window as any).ethereum);
const signer = provider.getSigner();

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

const zunamiAddress = '0x63eacf87ff7897b06705cabf56a3c5dad33dfa8c';
const activePoolId = 0;

const daiContract = new ethers.Contract(daiAddress, erc20, signer);
const usdcContract = new ethers.Contract(usdcAddress, erc20, signer);
const usdtContract = new ethers.Contract(usdtAddress, erc20, signer);
const zunamiContract = new ethers.Contract(zunamiAddress, zunami, signer);

export const deposit = async (dai: string, usdc: string, usdt: string): Promise<boolean> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return false;
    }
    const assets = [
        new BigNumber(parseFloat(dai)).times(DAI_TOKEN_DECIMAL).toString(),
        new BigNumber(parseFloat(usdc)).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(parseFloat(usdt)).times(USDT_TOKEN_DECIMAL).toString()
    ];
    zunamiContract.deposit(assets, activePoolId);
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

export const approve = async (token: string): Promise<boolean> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return false;
    }
    token === "DAI" && await daiContract.approve(zunamiAddress, ethers.constants.MaxUint256);
    token === "USDC" && await usdcContract.approve(zunamiAddress, ethers.constants.MaxUint256);
    token === "USDT" && await usdtContract.approve(zunamiAddress, ethers.constants.MaxUint256);
    return true;
};




// get user Balances
export const getUserBalances = async (): Promise<any> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return null;
    }
    try {
        const userAddress = await signer.getAddress();
        const daiBalance = await daiContract.balanceOf(userAddress);
        const usdcBalance = await usdcContract.balanceOf(userAddress);
        const usdtBalance = await usdtContract.balanceOf(userAddress);
        const balances = [
            new BigNumber(daiBalance._hex),
            new BigNumber(usdcBalance._hex),
            new BigNumber(usdtBalance._hex)
        ]
        return balances
    } catch (e) {
        return null
    }
}

// get user Allowance
export const getUserAllowance = async (): Promise<any> => {
    if (!isWalletConnected()) {
        console.log('Connect your wallet');
        return null;
    }
    try {
        const userAddress = await signer.getAddress();
        const daiAllowance = await daiContract.allowance(userAddress, zunamiAddress);
        const usdcAllowance = await usdcContract.allowance(userAddress, zunamiAddress);
        const usdtAllowance = await usdtContract.allowance(userAddress, zunamiAddress);
        const allowances = [
            new BigNumber(daiAllowance._hex).toNumber(),
            new BigNumber(usdcAllowance._hex).toNumber(),
            new BigNumber(usdtAllowance._hex).toNumber()
        ]
        return allowances
    } catch (e) {
        return null
    }
}

export const useUserBalances = () => {
    const [value, setValue] = useState(null)

    useEffect(() => {
        const fetchBalances = async () => {
            await getUserBalances().then(function(result) {
                setValue(result)
            });
        }
        fetchBalances()
        const refreshInterval = setInterval(fetchBalances, 10000)
        return () => clearInterval(refreshInterval)
    }, [])

    return value
}

export const useUserAllowances = () => {
    const [value, setValue] = useState(null)

    useEffect(() => {
        const fetchAllowances = async () => {
            await getUserAllowance().then(function(result) {
                setValue(result)
            });
        }
        fetchAllowances()
        const refreshInterval = setInterval(fetchAllowances, 10000)
        return () => clearInterval(refreshInterval)
    }, [])

    return value
}

export const useApprove = (token: string) => {

    const handleApprove = useCallback(async () => {
        try {
            const tx = await approve(token)
            return tx
        } catch (e) {
            return false
        }
    }, [])

    return { onApprove: handleApprove }
}