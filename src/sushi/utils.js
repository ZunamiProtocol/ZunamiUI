import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { contractAddresses } from './lib/constants'
import {getContract} from "../utils/erc20";
import {DEFAULT_TOKEN_DECIMAL, USDT_TOKEN_DECIMAL} from "../utils/formatbalance";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const getMasterChefAddress = (sushi) => {
  return sushi && sushi.masterChefAddress
}
export const getSushiAddress = (sushi) => {
  return sushi && sushi.sushiAddress
}
export const getWethAddress = (sushi) => {
  return contractAddresses.weth['1']
}
export const getUsdcAddress = (chainId = '0x1') => {
  const chainIdentifier = chainId.split('x')[1]
  return contractAddresses.usdc[chainIdentifier]
}
export const getWethContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.weth
}
export const getUsdcContract = (sushi) => {
    return sushi && sushi.contracts && sushi.contracts.usdc
}

export const getMasterChefContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.masterChef
}
export const getSushiContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.sushi
}

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
        }),
      )
    : []
}

export const getPoolWeight = async (masterChefContract, pid) => {
  const { allocPoint } = await masterChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await masterChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (masterChefContract, pid, account) => {
  return masterChefContract.methods.pendingSushi(pid, account).call()
}

// export const getTotalLPWethValue = async (
//   masterChefContract,
//   wethContract,
//   lpContract,
//   tokenContract,
//   pid,
// ) => {
  // Get balance of the token address
  // const tokenAmountWholeLP = await tokenContract.methods
  //   .balanceOf(lpContract.options.address)
  //   .call()
  // const tokenDecimals = await tokenContract.methods.decimals().call()
  // // Get the share of lpContract that masterChefContract owns
  // const balance = await lpContract.methods
  //   .balanceOf(masterChefContract.options.address)
  //   .call()
  //
  // const tokenBalanceIVF = new BigNumber(balance).div(
  //   new BigNumber(10).pow(tokenDecimals),
  // )
  //
  // // Convert that into the portion of total lpContract = p1
  // const totalSupply = await lpContract.methods.totalSupply().call()
  // // Get total weth value for the lpContract = w1
  // const lpContractWeth = await wethContract.methods
  //   .balanceOf(lpContract.options.address)
  //   .call()
  // // Return p1 * w1 * 2
  // const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  // const lpWethWorth = new BigNumber(lpContractWeth)
  // const totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))
  //
  // const tokenAmount = new BigNumber(tokenAmountWholeLP)
  //   .times(portionLp)
  //   .div(new BigNumber(10).pow(tokenDecimals))
  //
  // const wethAmount = new BigNumber(lpContractWeth)
  //   .times(portionLp)
  //   .div(new BigNumber(10).pow(18))
  //
  // return {
    // tokenAmount,
    // wethAmount,
    // totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    // tokenPriceInWeth: wethAmount.div(tokenAmount),
    // poolWeight: await getPoolWeight(masterChefContract, pid),
    // tokenBalanceIVF,
  // }
// }

export const approve = async (provider, tokenAddress, masterChefContract, account) => {
  const lpContract = getContract(provider, tokenAddress)
  return lpContract.methods
      .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
      .send({ from: account })
      .on('transactionHash', (tx) => {
          return tx.transactionHash
      })
}

export const stake = async (
  masterChefContract,
  account,
  dai,
  usdc,
  usdt
) => {
  return masterChefContract.methods.delegateDeposit(
      [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
      ]
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      // console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (
    masterChefContract,
    account,
    lpShares,
    dai,
    usdc,
    usdt
) => {
  return masterChefContract.methods.delegateWithdrawal(
      new BigNumber(lpShares).times(DEFAULT_TOKEN_DECIMAL).toString(),
      [
        new BigNumber(dai).times(DEFAULT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdc).times(USDT_TOKEN_DECIMAL).toString(),
        new BigNumber(usdt).times(USDT_TOKEN_DECIMAL).toString(),
      ]
  )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        // console.log(tx)
        return tx.transactionHash
      })
}


