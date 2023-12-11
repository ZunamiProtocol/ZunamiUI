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

export const getBalanceNumber = (balance: BigNumber, decimals = 18): BigNumber => {
    return new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals));
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18, decimalPlaces = 2) => {
    const newNumber = new BigNumber(balance);
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
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

// mainnet
export const daiAddress: Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
export const usdcAddress: Address = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const usdtAddress: Address = '0xdac17f958d2ee523a2206206994597c13d831ec7';
export const fraxAddress: Address = '0x853d955acef822db058eb8505911ed77f175b99e';
// sepolia
export const sepDaiAddress: Address = '0xdC30b3bdE2734A0Bc55AF01B38943ef04aaCB423';
export const sepUsdcAddress: Address = '0x2d691C2492e056ADCAE7cA317569af25910fC4cb';
export const sepUsdtAddress: Address = '0x8aaB454dFD2d3b483791698367fFEa8Cf3352Ee2';
// export const sepFraxAddress = '0x853d955acef822db058eb8505911ed77f175b99e';
