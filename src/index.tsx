import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getTheme } from './functions/theme';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi';
import reportWebVitals from './reportWebVitals';

const theme = getTheme();

if ([null, 'default'].indexOf(theme) === -1) {
    document.body.classList.add(theme);
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet],
    [alchemyProvider({ apiKey: 'Yh5zNTgJkqrOIqLtfkZBGIPecNPDQ1ON' }), publicProvider()]
);

// Set up wagmi config
const config = createConfig({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: 'wagmi',
            },
        }),
        new WalletConnectConnector({
            chains,
            options: {
                projectId: '5f63b90a6296d5f62024322d7b337912',
            },
        }),
        new InjectedConnector({
            chains,
            options: {
                name: 'Injected',
                shimDisconnect: true,
            },
        }),
    ],
    publicClient,
    webSocketPublicClient,
});

window.Buffer = window.Buffer || require('buffer').Buffer;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <App />
        </WagmiConfig>
    </React.StrictMode>
);

reportWebVitals();
