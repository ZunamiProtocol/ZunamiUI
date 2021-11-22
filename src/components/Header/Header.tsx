import React from 'react';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import './Header.scss';
import { Navbar, Container } from 'react-bootstrap';
import { Disclaimer } from '../Disclaimer/Disclaimer';
import { HowToUse } from '../HowToUse/HowToUse';

export const Header = (): JSX.Element => {
    return (
        <div className={'header'}>
            <img className={'logo'} src='logo.svg' alt='Logo of the Zunami Protocol' />
            <WalletStatus />
        </div>
    );
};
