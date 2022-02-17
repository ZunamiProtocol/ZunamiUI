import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getTheme } from './functions/theme';

const theme = getTheme();

if ([null, 'default'].indexOf(theme) === -1) {
    document.body.classList.add(theme);
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
