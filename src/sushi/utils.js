import BigNumber from 'bignumber.js';

import { contractAddresses } from './lib/constants';
import { getContract } from '../utils/erc20';
import {
    DEFAULT_TOKEN_DECIMAL,
    USDT_TOKEN_DECIMAL,
    USDT_BSC_TOKEN_DECIMAL,
    bscUsdtAddress,
    busdAddress,
    plgDaiAddress,
    plgUsdcAddress,
    plgUsdtAddress,
} from '../utils/formatbalance';
import { log } from '../utils/logger';
import { getZunamiAddress, isBSC, isPLG } from '../utils/zunami';

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
        } else if (chain === 56 || chainId === '0x38') {
            sushi.contracts.bscMasterChef.options.address = getZunamiAddress(chainId);
            result = sushi.contracts.bscMasterChef;
        } else if (chain === 137 || chainId === '0x89') {
            sushi.contracts.polygonContract.options.address = getZunamiAddress(chainId);
            result = sushi.contracts.polygonContract;
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
export const APPROVE_SUM = '10000000000000000000000000000';

const MaxUint256 = new BigNumber(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export const approve = async (
    provider,
    tokenAddress,
    masterChefContract,
    account,
    apprSum = MaxUint256,
    spenderAddress = false
) => {
    debugger;
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

    if ([plgDaiAddress, plgUsdcAddress, plgUsdtAddress].indexOf(tokenAddress) !== -1) {
        sum = APPROVE_SUM;
    }

    const funcParams = {
        from: account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
    };

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

    if (spenderAddress) {
        spender = spenderAddress;
    }

    log(
        `Executing approve() for address ${lpContract.options.address}. Params: ${spender}, ${sum}`
    );

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
    const isZerionWallet = window.ethereum?.walletMeta?.name === 'Zerion';

    const coins = [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
    ];

    if (isBSC(chainId)) {
        return contract.methods
            .delegateDeposit(new BigNumber(usdt).times(USDT_BSC_TOKEN_DECIMAL).toString())
            .send({ from: account })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    if (isPLG(chainId)) {
        log(
            `Polygon: delegateDeposit("${new BigNumber(usdt)
                .times(USDT_TOKEN_DECIMAL)
                .toString()}")`
        );

        return contract.methods
            .delegateDeposit(new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString())
            .send({
                from: account,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null,
            })
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    log(`Deposit: direct - ${direct}, coins: ${coins}, account: ${account}`);

    const transactionParams = {
        from: account,
    };

    if (direct) {
        log(`Zunami contract: execution deposit(${coins})`);

        if (isZerionWallet) {
            const estimate = await contract.methods.deposit(coins).estimateGas();
            transactionParams.gas = Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD);
        }

        return contract.methods
            .deposit(coins)
            .send(transactionParams)
            .on('transactionHash', (tx) => {
                return tx.transactionHash;
            });
    }

    log(`Zunami contract: execution delegateDeposit(${coins})`);

    if (isZerionWallet) {
        const estimate = await contract.methods.delegateDeposit(coins).estimateGas();
        transactionParams.gas = Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD);
    }

    return contract.methods
        .delegateDeposit(coins)
        .send(transactionParams)
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
 * Stake FRAX
 * @param {*} contract
 * @param {*} account
 * @param {*} frax
 * @returns
 */
export const stakeFRAX = async (contract, account, frax) => {
    const depositSum = new BigNumber(frax).times(USDT_BSC_TOKEN_DECIMAL).toString();

    log(`Exection [ZUN-FRAX]: deposit("${depositSum}", "0")`);

    return contract.methods
        .deposit(depositSum, '0')
        .send({ from: account })
        .on('transactionHash', (tx) => {
            return tx.transactionHash;
        });
};

/**
 * Stake APS
 * @param {*} contract
 * @param {*} account
 * @param {*} frax
 * @returns
 */
export const stakeAPS = async (contract, account, uzd) => {
    const depositSum = new BigNumber(uzd).times(USDT_BSC_TOKEN_DECIMAL).toString();

    log(`Exection [APS]: deposit("${depositSum}", "0")`);

    return contract.methods
        .deposit(depositSum)
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
        if (chainId && isBSC(chainId)) {
            log(`Zunami contract (BNB): execution delegateWithdrawal(${lpShares})`);

            return zunamiContract.methods
                .delegateWithdrawal(lpShares)
                .send({ from: account })
                .on('transactionHash', (transactionHash) => {
                    return transactionHash;
                });
        }

        if (chainId && isPLG(chainId)) {
            log(`Zunami contract (PLG): execution delegateWithdrawal(${lpShares})`);

            return zunamiContract.methods
                .delegateWithdrawal(lpShares)
                .send({
                    from: account,
                    maxPriorityFeePerGas: null,
                    maxFeePerGas: null,
                    gasPrice: null,
                })
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

/**
 * Withdraw function
 * @param Contract contract zunamiContract
 * @param string account Wallet address
 * @param {*} lpShares
 * @param boolean optimized Whether is should be an optimized withdraw (expensive) or not
 * @param number coinIndex Index of coin (0 - DAI, 1 - USDC, 2 - USDT)
 * @returns
 */
export const unstakeFrax = async (fraxContract, account, lpShares) => {
    log(`FRAX contract: execution withdraw(${lpShares}, 0`);
    const funcParams = { from: account };

    return fraxContract.methods
        .withdraw(lpShares, 0)
        .send(funcParams)
        .on('transactionHash', (transactionHash) => {
            return transactionHash;
        });
};
