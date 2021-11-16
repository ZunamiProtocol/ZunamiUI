import React from 'react';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import './Header.scss';

export const Header = (): JSX.Element => {
    return (
        <div className={'header'}>
            <img className={'logo'} src='logo.svg' alt='Logo of the Zunami Protocol' />
            <WalletStatus />
        </div>
    );
};
