import Web3 from 'web3';
import {provider as Provider} from 'web3-core';
import {Contract} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';
import ERC20 from '../actions/abi/erc20.abi.json';

export const getContract = (provider: Provider, address: string) => {
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(
        ERC20 as unknown as AbiItem,
        address,
    );
    return contract;
};

export const getAllowance = async (
    provider: Provider,
    tokenAddress: string,
    masterChefContract: Contract,
    account: string,
): Promise<string> => {
    const lpContract = getContract(provider, tokenAddress);
    try {
        const allowance: string = await lpContract.methods
            .allowance(account, masterChefContract.options.address)
            .call();
        return allowance;
    } catch (e) {
        return '0';
    }
};

export const getBalance = async (
    provider: Provider,
    tokenAddress: string,
    userAddress: string,
): Promise<string> => {
    const lpContract = getContract(provider, tokenAddress);
    try {
        const balance: string = await lpContract.methods
            .balanceOf(userAddress)
            .call();
        return balance;
    } catch (e) {
        return '0';
    }
};


export const getLpPrice = async (
    masterChefContract: Contract,
): Promise<string> => {
    try {
        const lpPrice: string = await masterChefContract.methods.lpPrice.call();
        return lpPrice;
    } catch (e) {
        return '0';
    }
};

export const getUserLpAmount = async (
    masterChefContract: Contract,
    userAddress: string
): Promise<string> => {
    try {
        const lpAmount: string = await masterChefContract.methods.balanceOf(userAddress).call();
        return lpAmount;
    } catch (e) {
        return '0';
    }
};



