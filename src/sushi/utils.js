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

/**
 * Deposit function
 * @param Contract contract zunamiContract
 * @param string account Wallet address
 * @param {*} lpShares
 * @param {*} dai
 * @param {*} usdc
 * @param {*} usdt
 * @param boolean optimized Whether is should be an optimized deposit (expensive) or not
 * @returns
 */
export const stake = async (contract, account, dai, usdc, usdt, direct = false) => {
    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
    ];

    if (!direct) {
        return contract.methods
            .deposit(coins)
            .send({ from: account })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    return contract.methods
        .delegateDeposit(coins)
        .send({ from: account })
        .on('transactionHash', (tx) => {
            return tx.transactionHash;
        });
};

/**
 * Withdraw function
 * @param Contract contract zunamiContract
 * @param string account Wallet address
 * @param {*} lpShares
 * @param {*} dai
 * @param {*} usdc
 * @param {*} usdt
 * @param boolean optimized Whether is should be an optimized withdraw (expensive) or not
 * @param number coinIndex Index of coin (0 - DAI, 1 - USDC, 2 - USDT)
 * @returns
 */
export const unstake = async (
    zunamiContract,
    account,
    lpShares,
    dai,
    usdc,
    usdt,
    optimized = true,
    coinIndex
) => {
    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
    ];

    if (optimized) {
        return zunamiContract.methods
            .delegateWithdrawal(lpShares, coins)
            .send({ from: account })
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    } else {
        return zunamiContract.methods
            .withdraw(lpShares, [0, 0, 0], 1, coinIndex)
            .send({ from: account })
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    }
};

export const getPendingDeposit = async (masterChefContract, account, index) => {
    try {
        return await masterChefContract.methods.accDepositPending(account, index).call();
    } catch (e) {
        return '0';
    }
};
