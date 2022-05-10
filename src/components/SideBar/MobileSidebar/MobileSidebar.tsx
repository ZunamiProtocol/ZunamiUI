import { useState } from 'react';
import './MobileSidebar.scss';
import { Navbar } from 'react-bootstrap';
import { Disclaimer } from '../../Disclaimer/Disclaimer';
import useOnlineState from '../../../hooks/useOnlineState';
import { ErrorToast } from '../../ErrorToast/ErrorToast';
import { WalletStatus } from '../../WalletStatus/WalletStatus';
import { ThemeSwitcher } from '../../ThemeSwitcher/ThemeSwitcher';
import { NavMenu } from '../../Header/NavMenu/NavMenu';

export const MobileSidebar = (): JSX.Element => {
    return (
        <div id="MobileSidebar">
            <NavMenu />
        </div>
    );
};
