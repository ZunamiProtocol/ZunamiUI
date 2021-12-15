import React from 'react';
import './NoWallet.scss';

export const NoWallet = (): JSX.Element => {
    return (
        <div className={'NoWallet'}>
            <img src="/disclaimer.svg" alt="" />
            <span>In order to use the app you have to connect your wallet</span>
        </div>
    );
};
