import BigNumber from 'bignumber.js';
import { Address } from 'viem';

export const BIG_TWO = new BigNumber(2);
export const BIG_TEN = new BigNumber(10);
export const BIG_ZERO = new BigNumber(0);
export const DEFAULT_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const DAI_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const USDT_TOKEN_DECIMAL = new BigNumber(10).pow(6);
export const USDT_BSC_TOKEN_DECIMAL = new BigNumber(10).pow(18);
export const DAI_DECIMALS = 12;
export const UZD_DECIMALS = 18;
export const NULL_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

export const getDecimalsByTokenIndex = (index: number) => {
    let result = USDT_TOKEN_DECIMAL;

    if (index === 0) {
        result = DAI_TOKEN_DECIMAL;
    }

    return result;
};

export const getBalanceNumber = (balance: BigNumber, decimals = 18): BigNumber => {
    return new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals));
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18, decimalPlaces = 2) => {
    const newNumber = new BigNumber(balance);
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).toFixed(decimalPlaces);
};

/**
 * Overrided toFixed without rounding
 * @param number
 * @param digits
 */
export function toFixed(number: number, digits: number = 2) {
    if (!number) {
        return 0;
    }

    return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits);
}
