import React from 'react';
import {Main} from './containers/Main';
import {FinanceOperations} from './containers/FinanceOperations';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import './App.scss';

function App() {
    return (
        <Router>
            <Route exact path='/' component={Main} />
            <Route
                path='/deposit'
                component={() => <FinanceOperations operationName='Deposit' />}
            />
            <Route
                path='/withdraw'
                component={() => <FinanceOperations operationName='Withdraw' />}
            />
        </Router>
    );
}

export default App;
