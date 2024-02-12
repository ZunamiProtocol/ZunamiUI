import { Address } from 'wagmi';
import { NULL_ADDRESS } from '../../utils/formatbalance';

// const apsAddress: Address = '0xCaB49182aAdCd843b037bBF885AD56A3162698Bd';
// const zethApsAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';
// const zethAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';

export const SUBTRACT_GAS_LIMIT = 100000;

// Main Omnipool controller
export const zunamiMainnetAddress: Address = '0x9df40870830d24c0506F7Cf5042f14C04590F8e5';
export const zunamiSepoliaAddress: Address = '0x3694Db838a8cAf3b1c234529bB1b447bd849F357';

// zunUSD APS controller

export const zunUsdApsAddress: Address = '0xd5deE282790a73297efF143f2466A253E5191266';
export const zunUsdApsSepoliaAddress: Address = '0x1C4e36edBa364406f181fe9B3a4E6FC023DED0bc';

// ZunUSD
export const zunUsdMainnetAddress: Address = '0x1Ecc4A2EE46e50327ADc4AB41fEc750075D30b0a';
export const zunUsdSepoliaAddress: Address = '0x83287Da602f0C32f6C9B09E2F1b2951767ebF239';

// ZUN token
export const zunTokenAddress: Address = NULL_ADDRESS;
export const zunTokenSepoliaAddress: Address = '0xAc4d9e15910701a10329040bDC71a484C9Ba3860';

// Staking
export const zunStakingAddress: Address = '0x748C4D2b68DA2ad9F20Dc021700589FC18D8BA75';
export const zunStakingSepoliaAddress: Address = '0x748C4D2b68DA2ad9F20Dc021700589FC18D8BA75';

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
