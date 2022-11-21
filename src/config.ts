import dotenv from 'dotenv';

dotenv.config();

type NETWORK = 'mainnet';

type Config = {
    INFURA_URL: string;
    CHAIN_ID: number;
    NETWORK: NETWORK;
};

let NETWORK = process.env.REACT_APP_NETWORK;

if (!NETWORK) {
    NETWORK = 'mainnet';
}

export const getNetworkConfig = (NETWORK: string): Config => {
    let CHAIN_ID;

    if (NETWORK === 'mainnet') {
        CHAIN_ID = 1;
    } else {
        throw new Error(`Unknown ${NETWORK}, permitted only mainnet or mainnet`);
    }

    if (window.ethereum && window.ethereum.chainId === '0x38') {
        return {
            INFURA_URL: `https://bscrpc.com`,
            CHAIN_ID: 56,
            NETWORK: 'mainnet',
        };
    }

    if (window.ethereum && window.ethereum.chainId === '0x89') {
        return {
            INFURA_URL: `https://polygon-rpc.com`,
            CHAIN_ID: 137,
            NETWORK: 'mainnet',
        };
    }

    return {
        INFURA_URL: `https://eth-mainnet.alchemyapi.io/v2/Yh5zNTgJkqrOIqLtfkZBGIPecNPDQ1ON`,
        CHAIN_ID,
        NETWORK,
    };
};

export default getNetworkConfig(NETWORK);
