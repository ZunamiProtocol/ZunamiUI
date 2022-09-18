import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { contractAddresses } from './lib/constants';
import { getContract } from '../utils/erc20';
import {
    DEFAULT_TOKEN_DECIMAL,
    USDT_TOKEN_DECIMAL,
    USDT_BSC_TOKEN_DECIMAL,
    bscUsdtAddress,
    busdAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { getZunamiAddress } from '../utils/zunami';

BigNumber.config({
    EXPONENTIAL_AT: 1000,
    DECIMAL_PLACES: 80,
});

export const GAS_LIMIT_THRESHOLD = 0.1;

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

// 10M
export const APPROVE_SUM = '10000000000000000000000000';

export const approve = async (
    provider,
    tokenAddress,
    masterChefContract,
    account,
    apprSum = ethers.constants.MaxUint256
) => {
    const lpContract = getContract(provider, tokenAddress);
    let sum = apprSum;
    const isZerionWallet = window.ethereum?.walletMeta?.name === 'Zerion';

    if (tokenAddress === bscUsdtAddress || tokenAddress === busdAddress) {
        sum = APPROVE_SUM;
    }

    if (tokenAddress === getZunamiAddress(56)) {
        sum = APPROVE_SUM;
    }

    if (tokenAddress === contractAddresses.uzd[1]) {
        sum = APPROVE_SUM;
    }

    const funcParams = { from: account };

    if (isZerionWallet) {
        const estimate = await lpContract.methods
            .approve(masterChefContract.options.address, sum)
            .estimateGas();
        funcParams.gas = Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD);
    }

    let spender = masterChefContract.options.address;

    if (tokenAddress === busdAddress) {
        spender = contractAddresses.busd[56];
    }

    log(`Executing approve for token ${tokenAddress} for ${sum} sum (spender ${spender})`);

    return lpContract.methods
        .approve(spender, sum)
        .send(funcParams)
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
        // function delegateDepositWithConversion(
        //     uint256 amountIn,
        //     uint256 amountOutMin
        // )

        // amountIn сколько надо депонировать, не забудь плиз про децималс 18
        // amountOutMin - 0
        // 0x4a062f1501f5FF149b973b70f7027d87622445F3

        return contract.methods
            .delegateDeposit(new BigNumber(usdt).times(USDT_BSC_TOKEN_DECIMAL).toString())
            .send({ from: account })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    log(`Deposit: direct - ${direct}, coins: ${coins}, account: ${account}`);

    if (direct) {
        log(`Zunami contract: execution deposit(${coins})`);
        const estimate = await contract.methods.deposit(coins).estimateGas();

        return contract.methods
            .deposit(coins)
            .send({ from: account, gas: Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD) })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    log(`Zunami contract: execution delegateDeposit(${coins})`);

    const estimate = await contract.methods.delegateDeposit(coins).estimateGas();

    return contract.methods
        .delegateDeposit(coins)
        .send({ from: account, gas: Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD) })
        .on('transactionHash', (tx) => {
            return tx.transactionHash;
        });
};

/**
 * Stake BUSD
 * @param {*} contract
 * @param {*} account
 * @param {*} busd
 * @returns
 */
export const stakeBUSD = async (contract, account, busd) => {
    const depositSum = new BigNumber(busd).times(USDT_BSC_TOKEN_DECIMAL).toString();

    log(`Exection [ZUN-BUSD]: delegateDepositWithConversion("${depositSum}", "0")`);

    return contract.methods
        .delegateDepositWithConversion(depositSum, '0')
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
    coinIndex,
    chainId = 1,
    needsGasEstimation = false
) => {
    const usdtVal = new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString();
    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        usdtVal,
    ];

    if (optimized) {
        if (chainId && chainId !== 1) {
            log(`Zunami contract (BNB): execution delegateWithdrawal(${lpShares})`);

            return zunamiContract.methods
                .delegateWithdrawal(lpShares)
                .send({ from: account })
                .on('transactionHash', (transactionHash) => {
                    return transactionHash;
                });
        }

        log(`Zunami contract: execution delegateWithdrawal(${lpShares}, ${coins})`);

        const funcParams = { from: account };

        if (needsGasEstimation) {
            const estimate = await zunamiContract.methods
                .delegateWithdrawal(lpShares, coins)
                .estimateGas();
            funcParams.gas = Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD);
        }

        return zunamiContract.methods
            .delegateWithdrawal(lpShares, coins)
            .send(funcParams)
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    } else {
        log(`Zunami contract: execution withdraw(${lpShares}, [0, 0, 0], 1, ${coinIndex})`);
        const funcParams = { from: account };

        if (needsGasEstimation) {
            const estimate = await zunamiContract.methods
                .withdraw(lpShares, [0, 0, 0], 1, coinIndex)
                .estimateGas();
            funcParams.gas = Math.floor(estimate + estimate * 0.55);
        }

        return zunamiContract.methods
            .withdraw(lpShares, [0, 0, 0], 1, coinIndex)
            .send(funcParams)
            .on('transactionHash', (transactionHash) => {
                return transactionHash;
            });
    }
};
