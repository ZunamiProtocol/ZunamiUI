import { Address } from 'wagmi';
import { NULL_ADDRESS } from '../../utils/formatbalance';

// const apsAddress: Address = '0xCaB49182aAdCd843b037bBF885AD56A3162698Bd';
// const zethApsAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';
// const zethAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';

export const SUBTRACT_GAS_LIMIT = 100000;

// Main Omnipool controller
export const zunamiMainnetAddress: Address = '0x618eee502CDF6b46A2199C21D1411f3F6065c940';
export const zunamiSepoliaAddress: Address = '0x3694Db838a8cAf3b1c234529bB1b447bd849F357';

// APS controller
export const zunUsdApsAddress: Address = '0xd9F559280c9d308549e84946C0d668a817fcCFB5';
export const zunUsdApsSepoliaAddress: Address = '0x1C4e36edBa364406f181fe9B3a4E6FC023DED0bc';

// ZunUSD
export const zunUsdMainnetAddress: Address = '0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6';
export const zunUsdSepoliaAddress: Address = '0x83287Da602f0C32f6C9B09E2F1b2951767ebF239';

// ZUN token
export const zunTokenAddress: Address = NULL_ADDRESS;
export const zunTokenSepoliaAddress: Address = '0xAc4d9e15910701a10329040bDC71a484C9Ba3860';

// Staking
export const zunStakingAddress: Address = '0x748C4D2b68DA2ad9F20Dc021700589FC18D8BA75';
export const zunStakingSepoliaAddress: Address = '0x748C4D2b68DA2ad9F20Dc021700589FC18D8BA75';

// ZAP
export const zunZapAddress: Address = '0x7aecF73B61a8579F7cf2Fe9b2a2d97339e9168Bf';
export const zunZapSepoliaAddress: Address = '0xB7D1424A4136ee7E13Db0EeB6e85a56f5F13Ef55';

// Stablecoins mainnet
export const daiAddress: Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
export const usdcAddress: Address = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const usdtAddress: Address = '0xdac17f958d2ee523a2206206994597c13d831ec7';
export const fraxAddress: Address = '0x853d955acef822db058eb8505911ed77f175b99e';
// Stablecoins sepolia
export const sepDaiAddress: Address = '0xdC30b3bdE2734A0Bc55AF01B38943ef04aaCB423';
export const sepUsdcAddress: Address = '0x2d691C2492e056ADCAE7cA317569af25910fC4cb';
export const sepUsdtAddress: Address = '0x8aaB454dFD2d3b483791698367fFEa8Cf3352Ee2';

export const getDaiAddress = (chainId: number | undefined): Address => {
    return chainId === 1 || !chainId ? daiAddress : sepDaiAddress;
};

export const getUsdcAddress = (chainId: number | undefined): Address => {
    return chainId === 1 || !chainId ? usdcAddress : sepUsdcAddress;
};

export const getUsdtAddress = (chainId: number | undefined): Address => {
    return chainId === 1 || !chainId ? usdtAddress : sepUsdtAddress;
};

export const contractAddresses: { [index: string]: any } = {
    zunami: {
        // ETH
        1: zunamiMainnetAddress,
        // Sepolia
        11155111: zunamiSepoliaAddress,
    },
    zunUSD: {
        1: zunUsdMainnetAddress,
        11155111: zunUsdSepoliaAddress,
    },
    zap: {
        1: zunZapAddress,
        11155111: zunZapSepoliaAddress,
    },
    uzd: {
        1: '0xb40b6608B2743E691C9B54DdBDEe7bf03cd79f1c',
    },
    frax: {
        1: '0x3D8aBC464D5313a576e78706aC97F79fe1EB0b61',
    },
    aps: {
        1: zunUsdApsAddress,
        11155111: zunUsdApsSepoliaAddress,
    },
    zun: {
        1: zunTokenAddress,
        11155111: zunTokenSepoliaAddress,
    },
    staking: {
        1: zunStakingAddress,
        11155111: zunStakingSepoliaAddress,
    },
    deprecated: {},
};
