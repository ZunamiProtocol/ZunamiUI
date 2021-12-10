import React from 'react';
import {Main} from './containers/Main';
import {FinanceOperations} from './containers/FinanceOperations';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {UseWalletProvider} from 'use-wallet';
import config from './config';

import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';

import EthereumExplorerProvider from "./contexts/EthereumExplorerProvider";
import SushiProvider from "./contexts/SushiProvider";
import TransactionProvider from "./contexts/Transactions";
import ModalsProvider from './contexts/Modals';


const {INFURA_URL, CHAIN_ID} = config;

function App() {
    return (
        <Providers>
            <Router>
                <Route exact path="/" component={Main}/>
                <Route
                    path="/deposit"
                    component={() => <FinanceOperations operationName="Deposit"/>}
                />
                <Route
                    path="/withdraw"
                    component={() => <FinanceOperations operationName="Withdraw"/>}
                />
            </Router>
        </Providers>
    );
}

const Providers: React.FC = ({children}) => {
    return (
        <EthereumExplorerProvider
            chainId={CHAIN_ID}>
            <UseWalletProvider
                // @ts-ignore
                chainId={CHAIN_ID}
                connectors={{walletconnect: {rpcUrl: INFURA_URL}}}
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
