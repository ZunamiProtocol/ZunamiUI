import React from 'react';

import { WalletStatus } from '../WalletStatus/WalletStatus';
import './Header.scss';
import { Navbar, Container } from 'react-bootstrap';
import { Disclaimer } from '../Disclaimer/Disclaimer';
import { HowToUse } from '../HowToUse/HowToUse';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';

export const Header = (): JSX.Element => {
    return (
        <Navbar expand="lg" className={'header'}>
            <Container className={'mt-3 header-container'}>
                <Navbar.Brand href="/">
                    <img className={'Logo'} src='logo.svg' alt='Logo of the Zunami Protocol' />
                </Navbar.Brand>
                <Navbar.Collapse className ="d-flex justify-content-end align-items-center zun-gap">
                    <div className={'d-none d-sm-block'}>
                        <Disclaimer
                            text={'Please note. This is a beta version. The contract has not been auditied yet. Use it at your own risk.'}
                        />
                    </div>
                    <HowToUse />
                    <ThemeSwitcher />
                    <WalletStatus />
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
