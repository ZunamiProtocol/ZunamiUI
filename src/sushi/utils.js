import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { contractAddresses } from './lib/constants';
import { getContract } from '../utils/erc20';
import {
    DEFAULT_TOKEN_DECIMAL,
    USDT_TOKEN_DECIMAL,
    USDT_BSC_TOKEN_DECIMAL,
    bscUsdtAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { getZunamiAddress } from '../utils/zunami';

BigNumber.config({
    EXPONENTIAL_AT: 1000,
    DECIMAL_PLACES: 80,
});

export const GAS_LIMIT = '100000';

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
export const getMasterChefContract = (sushi, chain = 1) => {
    const chainId = chain ? chain : window?.ethereum?.chainId;
    let result = undefined;

    if (sushi && sushi.contracts) {
        if (chain === 1 || chainId === '0x1') {
            // sushi.contracts.masterChef.options.address = getZunamiAddress(chainId);
            result = sushi.contracts.masterChef;
        } else {
            sushi.contracts.bscMasterChef.options.address = getZunamiAddress(chainId);
            result = sushi.contracts.bscMasterChef;
        }
    }

    return result;
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

export const approve = async (
    provider,
    tokenAddress,
    masterChefContract,
    account,
    apprSum = ethers.constants.MaxUint256
) => {
    const lpContract = getContract(provider, tokenAddress);
    let sum = apprSum;

    if (tokenAddress === bscUsdtAddress) {
        sum = '10000000000000000000000000';
    }

    if (tokenAddress === getZunamiAddress(56)) {
        sum = '10000000000000000000000000';
    }

    return lpContract.methods
        .approve(masterChefContract.options.address, sum)
        .send({
            from: account,
            gas: GAS_LIMIT,
        })
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
export const stake = async (contract, account, dai, usdc, usdt, direct = false, chainId = 1) => {
    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
    ];
    if (chainId !== 1) {
        return contract.methods
            .delegateDeposit(new BigNumber(usdt).times(USDT_BSC_TOKEN_DECIMAL).toString())
            .send({ from: account })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    // const gas = esitamateGas(contract);

    log(`Deposit: direct - ${direct}, coins: ${coins}, account: ${account}`);

    if (direct) {
        log(`Zunami contract: execution deposit(${coins})`);
        return contract.methods
            .deposit(coins)
            .send({ from: account})
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    log(`Zunami contract: execution delegateDeposit(${coins})`);

    return contract.methods
        .delegateDeposit(coins)
        .send({ from: account, gas: GAS_LIMIT })
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
    coinIndex,
    chainId = 1
) => {
    const usdtVal = new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString();
    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        usdtVal,
    ];

    if (optimized) {
        if (chainId !== 1) {
            log(`Zunami contract (BNB): execution delegateWithdrawal(${lpShares})`);

            return zunamiContract.methods
                .delegateWithdrawal(lpShares)
                .send({ from: account })
                .on('transactionHash', (transactionHash) => {
                    return transactionHash;
                });
        }

        log(`Zunami contract: execution delegateWithdrawal(${lpShares}, ${coins})`);

        return zunamiContract.methods
            .delegateWithdrawal(lpShares, coins)
            .send({ from: account, gas: GAS_LIMIT })
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    } else {
        log(`Zunami contract: execution withdraw(${lpShares}, [0, 0, 0], 1, ${coinIndex})`);
        return zunamiContract.methods
            .withdraw(lpShares, [0, 0, 0], 1, coinIndex)
            .send({ from: account, gas: GAS_LIMIT })
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    }
};
