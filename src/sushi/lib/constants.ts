import { Address } from 'wagmi';
import { NULL_ADDRESS } from '../../utils/formatbalance';

const apsAddress: Address = '0xCaB49182aAdCd843b037bBF885AD56A3162698Bd';
const zethApsAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';
const zethAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';

export const SUBTRACT_GAS_LIMIT = 100000;

// Main Omnipool controller
export const zunamiMainnetAddress: Address = NULL_ADDRESS;
export const zunamiSepoliaAddress: Address = '0x3694Db838a8cAf3b1c234529bB1b447bd849F357';

// zunUSD APS controller
export const zunUsdApsAddress: Address = NULL_ADDRESS;
export const zunUsdApsSepoliaAddress: Address = '0x1C4e36edBa364406f181fe9B3a4E6FC023DED0bc';

const zunUsdMainnetAddress: Address = NULL_ADDRESS;
export const zunUsdSepoliaAddress: Address = '0x83287Da602f0C32f6C9B09E2F1b2951767ebF239';

// ZUN token
export const zunTokenAddress: Address = NULL_ADDRESS;
export const zunTokenSepoliaAddress: Address = '0xAc4d9e15910701a10329040bDC71a484C9Ba3860';

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
    usdc: {
        1: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    uzd: {
        1: '0xb40b6608B2743E691C9B54DdBDEe7bf03cd79f1c',
    },
    frax: {
        1: '0x3D8aBC464D5313a576e78706aC97F79fe1EB0b61',
    },
    aps: {
        1: zunUsdMainnetAddress,
        11155111: zunUsdApsSepoliaAddress,
    },
    zun: {
        1: zunTokenAddress,
        11155111: zunTokenSepoliaAddress,
    },
    zethAPS: {
        1: zethApsAddress,
    },
    zeth: {
        1: zethAddress,
    },
    deprecated: {},
};
