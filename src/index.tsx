import ReactDOM from 'react-dom/client';
import App from './App';
import { getTheme } from './functions/theme';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia } from 'wagmi';
import reportWebVitals from './reportWebVitals';
import { createModal } from '@rabby-wallet/rabbykit';

const theme = getTheme();

if ([null, 'default'].indexOf(theme) === -1) {
    document.body.classList.add(theme);
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, sepolia],
    [alchemyProvider({ apiKey: 'Yh5zNTgJkqrOIqLtfkZBGIPecNPDQ1ON' }), publicProvider()]
);

const wcProjectId = '5f63b90a6296d5f62024322d7b337912';

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
                projectId: wcProjectId,
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

export const rabbyKit = createModal({
    chains,
    wagmi: config,
    projectId: wcProjectId,
    appName: 'RabbyKit',
    theme: 'dark',
});

window.Buffer = window.Buffer || require('buffer').Buffer;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    // <React.StrictMode>
    <WagmiConfig config={config}>
        <App />
    </WagmiConfig>
    // </React.StrictMode>
);

reportWebVitals();
