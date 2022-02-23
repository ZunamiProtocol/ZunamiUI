import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { contractAddresses } from './lib/constants';
import { getContract } from '../utils/erc20';
import { DEFAULT_TOKEN_DECIMAL, USDT_TOKEN_DECIMAL } from '../utils/formatbalance';

BigNumber.config({
    EXPONENTIAL_AT: 1000,
    DECIMAL_PLACES: 80,
});

export const getMasterChefAddress = (sushi) => {
    return sushi && sushi.masterChefAddress;
};
export const getSushiAddress = (sushi) => {
    return sushi && sushi.sushiAddress;
};
export const getWethAddress = (sushi) => {
    return contractAddresses.weth['1'];
};
export const getUsdcAddress = (chainId = '0x1') => {
    const chainIdentifier = chainId.split('x')[1];
    return contractAddresses.usdc[chainIdentifier];
};
export const getWethContract = (sushi) => {
    return sushi && sushi.contracts && sushi.contracts.weth;
};
export const getUsdcContract = (sushi) => {
    return sushi && sushi.contracts && sushi.contracts.usdc;
};

export const getMasterChefContract = (sushi) => {
    return sushi && sushi.contracts && sushi.contracts.masterChef;
};
export const getSushiContract = (sushi) => {
    return sushi && sushi.contracts && sushi.contracts.sushi;
};

export const getFarms = (sushi) => {
    return sushi
        ? sushi.contracts.pools.map(
              ({
                  pid,
                  name,
                  symbol,
                  icon,
                  tokenAddress,
                  tokenSymbol,
                  tokenContract,
                  lpAddress,
                  lpContract,
              }) => ({
                  pid,
                  id: symbol,
                  name,
                  lpToken: symbol,
                  lpTokenAddress: lpAddress,
                  lpContract,
                  tokenAddress,
                  tokenSymbol,
                  tokenContract,
                  earnToken: 'SUSHI',
                  earnTokenAddress: sushi.contracts.sushi.options.address,
                  icon,
              })
          )
        : [];
};

export const approve = async (provider, tokenAddress, masterChefContract, account) => {
    const lpContract = getContract(provider, tokenAddress);
    return lpContract.methods
        .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
        .send({ from: account })
        .on('transactionHash', (tx) => {
            return tx.transactionHash;
        });
};

export const stake = async (masterChefContract, account, dai, usdc, usdt) => {
    return masterChefContract.methods
        .delegateDeposit([
            new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
            new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
            new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
        ])
        .send({ from: account })
        .on('transactionHash', (tx) => {
            // console.log(tx)
            return tx.transactionHash;
        });
};

export const unstake = async (masterChefContract, account, lpShares, dai, usdc, usdt) => {
    return masterChefContract.methods
        .delegateWithdrawal(new BigNumber(lpShares).times(DEFAULT_TOKEN_DECIMAL).toString(), [
            new BigNumber(dai).multipliedBy(0.997).times(DEFAULT_TOKEN_DECIMAL).toString(),
            new BigNumber(usdc).multipliedBy(0.997).times(USDT_TOKEN_DECIMAL).toString(),
            new BigNumber(usdt).multipliedBy(0.997).times(USDT_TOKEN_DECIMAL).toString(),
        ])
        .send({ from: account })
        .on('transactionHash', (tx) => {
            // console.log(tx)
            return tx.transactionHash;
        });
};

export const getPendingDeposit = async (masterChefContract, account, index) => {
    try {
        return await masterChefContract.methods.accDepositPending(account, index).call();
    } catch (e) {
        return '0';
    }
};
