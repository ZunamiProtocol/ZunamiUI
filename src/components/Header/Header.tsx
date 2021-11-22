import React from 'react';

import { WalletStatus } from '../WalletStatus/WalletStatus';
import './Header.scss';
import { Navbar, Container } from 'react-bootstrap';
import { Disclaimer } from '../Disclaimer/Disclaimer';
import { HowToUse } from '../HowToUse/HowToUse';

export const Header = (): JSX.Element => {
    return (
        <Navbar expand="lg" className={'header'}>
            <Container className={'mt-3'}>
                <Navbar.Brand href="/">
                    <img className={'Logo'} src='logo.svg' alt='Logo of the Zunami Protocol' />
                </Navbar.Brand>
                <Navbar.Collapse className="d-flex justify-content-end align-items-center zun-gap">
                    <Disclaimer
                        text={'Please note. This is a beta version. The contract has not been auditied yet. Use it at your own risk.'}
                    />
                    <HowToUse />
                    <WalletStatus />
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
