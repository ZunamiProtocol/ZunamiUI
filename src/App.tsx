import React from 'react';
import { Main } from './containers/Main';
import { FinanceOperations } from './containers/FinanceOperations';
import { Staking } from './containers/Staking';
import { Lockdrop } from './containers/Lockdrop';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { UseWalletProvider } from 'use-wallet';
import config from './config';

import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';

import EthereumExplorerProvider from './contexts/EthereumExplorerProvider';
import SushiProvider from './contexts/SushiProvider';
import TransactionProvider from './contexts/Transactions';
import ModalsProvider from './contexts/Modals';

const { INFURA_URL, CHAIN_ID } = config;

function App() {
    return (
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
                <Route path="/staking" component={() => <Staking />} />
                <Route path="/lockdrop" component={() => <Lockdrop />} />
            </Router>
        </Providers>
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
