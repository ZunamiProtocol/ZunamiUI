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

    return {
        INFURA_URL: `https://${NETWORK}.infura.io/v3/2313ef889bea4d86ac8a997f09186617`,
        CHAIN_ID,
        NETWORK,
    };
};

export default getNetworkConfig(NETWORK);
