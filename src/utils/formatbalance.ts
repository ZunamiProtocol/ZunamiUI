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

// export const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
// export const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
// export const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
export const daiAddress = '0x3400DDE27aafF9F733cff6903A57d87C8b2Fc907';
export const usdcAddress = '0x15658E0c7616ec94910134c2861C7B0699a726D7';
export const usdtAddress = '0x0e628afa58406343694aa7736b302356e86eb8e7';