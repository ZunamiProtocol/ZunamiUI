import React from 'react';
import './Header.scss';

export const Header = (): JSX.Element => {
    return (
        <div className={'header'}>
            <img className={'logo'} src='logo.png' alt='Logo of the Zunami Protocol' />
            <div className={'wallet'}>
                <img src='wallet.png' alt='' />
                <p>Connect Wallet</p>
            </div>
        </div>
    );
};
