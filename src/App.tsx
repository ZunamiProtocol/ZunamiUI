import React, { Suspense } from 'react';
import { Main } from './containers/Main';
import { Uzd } from './containers/Uzd';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';
import { Preloader } from './components/Preloader/Preloader';
import { UseWalletProvider } from 'use-wallet';
import EthereumExplorerProvider from './contexts/EthereumExplorerProvider';
import SushiProvider from './contexts/SushiProvider';
import TransactionProvider from './contexts/Transactions';
import ModalsProvider from './contexts/Modals';
import config from './config';

const FinanceOperations = React.lazy(() =>
    import('./containers/FinanceOperations').then((module) => ({
        default: module.FinanceOperations,
    }))
);

const { INFURA_URL, CHAIN_ID } = config;

function App() {
    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <Providers>
                <Router>
                    <Route exact path="/" component={Main} />
                    <Route
                        path="/deposit"
                        component={() => <FinanceOperations operationName="Deposit" />}
                    />
                    <Route
                        path="/withdraw"
                        component={() => <FinanceOperations operationName="withdraw" />}
                    />
                    <Route path="/uzd" component={Uzd} />
                </Router>
            </Providers>
        </Suspense>
    );
}

const Providers: React.FC = ({ children }) => {
    return (
        <EthereumExplorerProvider chainId={CHAIN_ID}>
            <UseWalletProvider
                // @ts-ignore
                chainId={CHAIN_ID}
                connectors={{
                    walletconnect: {
                        rpc: {
                            1: INFURA_URL,
                        },
                    },
                    injected: {
                        chainId: [1, 3, 4, 10, 56, 100, 137, 250, 1284, 1285, 43114, 42161],
                    },
                    walletlink: {
                        chainId: 1,
                        url: 'https://mainnet.eth.aragon.network/',
                    },
                }}
            >
                <SushiProvider>
                    <TransactionProvider>
                        <ModalsProvider>{children}</ModalsProvider>
                    </TransactionProvider>
                </SushiProvider>
            </UseWalletProvider>
        </EthereumExplorerProvider>
    );
};

export default App;
