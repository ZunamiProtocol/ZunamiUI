import React from 'react';
import './Header.scss';

export const Header = (): JSX.Element => {
    return (
        <div className={'header'}>
            <img className={'logo'} src='logo.svg' alt='Logo of the Zunami Protocol' />
            <div className={'wallet'}>
                <img src='wallet.svg' alt='' />
                <p>Connect Wallet</p>
            </div>
        </div>
    );
};
