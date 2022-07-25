import React, { createContext, useEffect, useState } from 'react';
import { NetworkConnector } from './NetworkConnector';

import config from './../../config';

const { INFURA_URL, CHAIN_ID } = config;

const getProvider = async ({ chainId }: { chainId: number }) => {
    const connector = new NetworkConnector({
        urls: {
            [1]: 'https://eth-mainnet.alchemyapi.io/v2/Yh5zNTgJkqrOIqLtfkZBGIPecNPDQ1ON',
            [56]: 'https://bscrpc.com',
        },
        defaultChainId: CHAIN_ID,
    });
    await connector.activate();
    const provider = await connector.getProvider();
    return provider;
};

interface ExplorerContext {
    provider?: any;
}

export const Context = createContext<ExplorerContext>({
    provider: undefined,
});

const EthereumExplorerProvider: React.FC<{ chainId?: number }> = ({ children, chainId = 1 }) => {
    const [provider, setProvider] = useState<any>(null);
    const createProvider = async (chainId: number) => {
        const createdProvider = await getProvider({ chainId });
        setProvider(createdProvider);
    };
    useEffect(() => {
        createProvider(chainId);
    }, [chainId]);
    const context: ExplorerContext = {
        provider,
    };
    return <Context.Provider value={context}>{children}</Context.Provider>;
};

export default EthereumExplorerProvider;
