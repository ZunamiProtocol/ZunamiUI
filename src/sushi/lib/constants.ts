import { Address } from 'wagmi';

const apsAddress: Address = '0xCaB49182aAdCd843b037bBF885AD56A3162698Bd';
const zethApsAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';
const zethAddress: Address = '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b';

export const SUBTRACT_GAS_LIMIT = 100000;

export const contractAddresses = {
    zunami: {
        // ETH
        1: '0x2ffCC661011beC72e1A9524E12060983E74D14ce',
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
        1: apsAddress,
    },
    zethAPS: {
        1: zethApsAddress,
    },
    zeth: {
        1: zethAddress,
    },
    deprecated: {},
};
