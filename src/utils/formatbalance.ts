import BigNumber from 'bignumber.js';

export const BIG_TWO = new BigNumber(2);
export const BIG_TEN = new BigNumber(10);
export const BIG_ZERO = new BigNumber(0);
export const DEFAULT_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const DAI_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const USDT_TOKEN_DECIMAL = new BigNumber(10).pow(6);
export const USDT_BSC_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const DAI_DECIMALS = 12;

export const getBalanceNumber = (balance: BigNumber, decimals = 18): BigNumber => {
    return new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals));
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
    const newNumber = new BigNumber(balance);
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).toFixed(2, 1);
};

/**
 * Overrided toFixed without rounding
 * @param number
 * @param digits
 */
export function toFixed(number: number, digits: number = 2) {
    return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
}

// mainnet
export const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
export const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
// bsc
export const bscUsdtAddress = '0x55d398326f99059ff775485246999027b3197955';
