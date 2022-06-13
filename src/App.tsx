import React, { Suspense } from 'react';
import { Main } from './containers/Main';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { UseWalletProvider } from 'use-wallet';
import config from './config';

import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';

import EthereumExplorerProvider from './contexts/EthereumExplorerProvider';
import SushiProvider from './contexts/SushiProvider';
import TransactionProvider from './contexts/Transactions';
import ModalsProvider from './contexts/Modals';
import {Preloader} from './components/Preloader/Preloader';

const FinanceOperations = React.lazy(
    () => import('./containers/FinanceOperations').then(module => ({ default: module.FinanceOperations }))
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
                        component={() => <FinanceOperations operationName="Withdraw" />}
                    />
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
                        chainId: [1, 3, 4],
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
