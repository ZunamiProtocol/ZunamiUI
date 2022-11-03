import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import useEthExplorer from '../../hooks/useEthExplorer';
import { Sushi } from '../../sushi';

export interface SushiContext {
    sushi?: typeof Sushi;
}

export const Context = createContext<SushiContext>({
    sushi: undefined,
});

declare global {
    interface Window {
        sushisauce: any;
    }
}

const sushiConfig: any = {
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: '6000000',
    defaultGasPrice: '1000000000000',
    accounts: [],
    ethereumNodeTimeout: 10000,
};

const createSushiLib = (provider: any, chainId: number, defaultAccount: string) => {
    return new Sushi(provider, chainId, false, {
        defaultAccount,
        ...sushiConfig,
    });
};

type Config = {
    chainId: number;
    defaultAccount: string;
    provider: any;
};

const SushiProvider: React.FC = ({ children }) => {
    const { ethereum, chainId } = useWallet();
    const { provider } = useEthExplorer();
    const [sushi, setSushi] = useState<any>();

    // @ts-ignore
    window.sushi = sushi;
    // @ts-ignore
    window.eth = ethereum;

    useEffect(() => {
        let config: Config | null = null;
        if (ethereum) {
            config = {
                chainId: Number(ethereum.chainId),
                defaultAccount: ethereum.selectedAddress,
                provider: ethereum,
            };
        } else if (provider) {
            config = {
                chainId: Number(provider.chainId),
                defaultAccount: '0x0000000000000000000000000000000000000000',
                provider,
            };
        }
        if (config) {
            const sushiLib = createSushiLib(config.provider, config.chainId, config.defaultAccount);
            setSushi(sushiLib);
            window.sushisauce = sushiLib;
        }
    }, [provider, ethereum, chainId]);

    return <Context.Provider value={{ sushi }}>{children}</Context.Provider>;
};

export default SushiProvider;
