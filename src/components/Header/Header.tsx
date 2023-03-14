import { useEffect, useState } from 'react';
import './Header.scss';
import { Navbar } from 'react-bootstrap';
import useOnlineState from '../../hooks/useOnlineState';
import { ErrorToast } from '../ErrorToast/ErrorToast';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { NavMenu } from './NavMenu/NavMenu';
import { NetworkSelector } from '../NetworkSelector/NetworkSelector';
import { useWallet } from 'use-wallet';
import { isETH } from '../../utils/zunami';
import { useGasPrice } from '../../hooks/useGasPrice';

function chainNameToTooltip(chainId: number) {
    if (chainId === 1 || !chainId) {
        return (
            <div>
                Please note. The contract{' '}
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://github.com/ZunamiLab/ZunamiProtocol/tree/main/audit"
                >
                    has been audited
                </a>
                , <br />
                but it's still a beta version. Use it at your own risk
            </div>
        );
    } else {
        return (
            <div>
                Please note. This is the alpha version of the BSC cross-chain gateway. Use it at
                your own risk!
            </div>
        );
    }
}

export const Header = (): JSX.Element => {
    const logoVariant = document.body.classList.contains('dark') ? 'logo-dark.svg' : 'logo.svg';
    const [open, setOpen] = useState(false);
    const isOnline = useOnlineState();
    const { chainId, account } = useWallet();
    const [gasPrice, setGasPrice] = useState('');
    const [showServices, setShowServices] = useState(false);

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=UPPVCS8VTCCNT3T83BZ8H6YRE9WVDY6W2P'
        )
            .then((response) => response.json())
            .then((data) => {
                setGasPrice(Number(data.result.ProposeGasPrice));
            });
    }, []);

    return (
        <Navbar expand="lg" className={'Header'}>
            <ErrorToast visible={!isOnline} />
            <div className="inner h-100">
                <NavMenu
                    onSelect={() => {
                        document.body.classList.remove('overflow');
                    }}
                />
                <div className="d-flex align-items-center d-none d-lg-flex" style={{ gap: '5px' }}>
                    <button className="btn btn-light btn-sm d-flex align-items-center">
                        <svg
                            className="me-2"
                            width="4"
                            height="4"
                            viewBox="0 0 4 4"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="2" cy="2" r="2" fill="#84B900" />
                        </svg>
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 392.69 348.59"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g data-name="Слой 1">
                                <path
                                    fill="#000000"
                                    d="m164.96 54.505h-55.693c-27.802 0-50.421 22.21-50.421 49.509v46.257c0 27.3 22.619 49.51 50.42 49.51h55.694c27.802 0 50.421-22.21 50.421-49.51v-46.257c0-27.3-22.62-49.51-50.42-49.51zm31.07 49.509v46.257c0 16.796-13.938 30.462-31.07 30.462h-55.693c-17.132 0-31.07-13.666-31.07-30.462v-46.257c0-16.796 13.938-30.461 31.07-30.461h55.693c17.132 0 31.07 13.665 31.07 30.46z"
                                />
                                <path
                                    fill="#000000"
                                    d="M392.674 285.498V145.331c-.005-18.889-5.275-35.307-15.662-48.798-10.352-13.444-25.957-24.187-46.384-31.931-4.967-1.89-10.575.556-12.5 5.446a9.331 9.331 0 0 0 .15 7.245c1.043 2.355 2.958 4.161 5.394 5.084 16.926 6.417 29.169 14.644 37.43 25.153 8.218 10.454 12.216 22.833 12.221 37.845l.006 140.408c.176 5.785-2.185 11.396-6.478 15.39-3.966 3.686-9.054 5.57-13.964 5.169-9.765-.798-17.597-10.424-17.1-21.088v-73.116c-.023-8.626-2.063-30.666-20.457-48.987-14.38-14.32-31.433-18.755-41.111-20.12V78.062C274.219 35.019 238.548 0 194.702 0H79.516C35.67 0 0 35.019 0 78.063v192.47c0 43.042 35.67 78.06 79.516 78.06h115.186c43.846 0 79.517-35.018 79.517-78.06V162.334c7.752 1.473 18.259 5.157 27.345 14.207 13.743 13.688 14.857 30.73 14.872 35.622l.01 72.649c-.981 20.689 14.649 38.862 34.836 40.512.935.078 1.911.118 2.904.118 9.51 0 18.727-3.703 25.956-10.425 8.301-7.721 12.87-18.496 12.532-29.519ZM254.866 270.57c-.02 32.519-27.01 58.975-60.164 58.975H79.516c-33.175 0-60.164-26.473-60.164-59.012V78.063c0-32.542 26.989-59.015 60.164-59.015h115.186c33.175 0 60.164 26.473 60.164 59.014v192.471h1.5l-1.5.037Z"
                                />
                            </g>
                        </svg>

                        <span className="ms-2">{gasPrice}</span>
                    </button>
                    <ThemeSwitcher />
                    <button type="button" className="btn btn-sm btn-outline-dark all-services-btn" onClick={() => {
                        setShowServices(!showServices);
                        document.getElementById('all-services')?.classList.toggle('active');
                        document.getElementById('sidebar-col')?.classList.toggle('transparent');
                        document.getElementById('nav-menu')?.classList.toggle('hidden');
                    }}>
                        {showServices ? 'Back' : 'All services'}
                    </button>
                </div>
            </div>
        </Navbar>
    );
};
