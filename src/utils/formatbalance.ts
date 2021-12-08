import BigNumber from 'bignumber.js'

export const BIG_TWO = new BigNumber(2)
export const BIG_TEN = new BigNumber(10)
export const BIG_ZERO = new BigNumber(0)
export const DEFAULT_TOKEN_DECIMAL = new BigNumber(10).pow(18)
export const DAI_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const USDT_TOKEN_DECIMAL = new BigNumber(10).pow(6);

export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
    const displayBalance = new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals))
    return displayBalance.toNumber()
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
    const newNumber = new BigNumber(balance)
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).toFixed()
}
