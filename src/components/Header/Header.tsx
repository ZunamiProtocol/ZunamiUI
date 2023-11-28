import { useEffect, useRef, useState } from 'react';
import './Header.scss';
import { Navbar, OverlayTrigger, Popover } from 'react-bootstrap';
import useOnlineState from '../../hooks/useOnlineState';
import { ErrorToast } from '../ErrorToast/ErrorToast';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import { NavMenu } from './NavMenu/NavMenu';
import { getTransHistoryUrl } from '../../api/api';
import { format } from 'date-fns';
import { log } from '../../utils/logger';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { isETH } from '../../utils/zunami';
import { useGasPrice } from '../../hooks/useGasPrice';
import { WalletButton } from '../WalletButton/WalletButton';
import { Network, NetworkSelector, networks } from '../NetworkSelector/NetworkSelector';

function renderNotifications(notifications: Array<any>) {
    return (
        <div className="notifications-list">
            <div className="title mt-2 ms-2 fs-6">Notifications</div>
            <div className="ms-2 mt-1">
                {!notifications.length && (
                    <div className="text-muted">Everything is up to date</div>
                )}
                {notifications.map((notification, index) => (
                    <div className="notification" key={index}>
                        <div className="first-row">
                            <div className="">
                                <span>
                                    {notification.type.charAt(0).toUpperCase() +
                                        notification.type.slice(1)}
                                </span>
                                <span className="vela-sans">&nbsp;initiated</span>
                            </div>
                            <div className="date">
                                {format(new Date(notification.dateTime), 'd MMM, yyyy, h:mm a')}
                            </div>
                        </div>
                        <div className="second-row">
                            <div className="d-flex align-items-center gap-1">
                                <span className="fw-semibold">Completed</span>
                                <div className={`status ${notification.status}`}></div>
                            </div>
                            <div>
                                {notification.type === 'deposit' && (
                                    <a href="/deposit">Deposit & Withdraw &gt;</a>
                                )}
                                {notification.type === 'withdraw' && (
                                    <a href="/withdraw">Deposit & Withdraw &gt;</a>
                                )}
                                {notification.type === 'mint' && <a href="/zstables">UZD &gt;</a>}
                                {notification.type === 'redeem' && <a href="/zstables">UZD &gt;</a>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const getTransactionHistory = async (
    account: string,
    type: string,
    chainId: number,
    section: string
) => {
    const url = getTransHistoryUrl(account, type, 1, 3, chainId, section);

    try {
        const response = await fetch(url);
        const data = await response.json();
        return ['MINT', 'REDEEM'].indexOf(type) !== -1 ? data.uzdTransfers : data.userTransfers;
    } catch (error) {
        return [];
    }
};

interface HeaderProps extends React.HTMLProps<HTMLDivElement> {
    section?: string;
}

export const Header: React.FC<HeaderProps> = ({ section }) => {
    const isOnline = useOnlineState();
    const { connect, connectors } = useConnect();
    const { address: account, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : 1;
    const [gasPrice, setGasPrice] = useState('');

    const notificationsTarget = useRef(null);
    const [showServices, setShowServices] = useState(false);

    const [showNotifications, setNotificationsState] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationsPopover = (
        <Popover
            onMouseEnter={() => setNotificationsState(true)}
            onMouseLeave={() => setNotificationsState(false)}
            className="notifications-popover"
        >
            <Popover.Body>{renderNotifications(notifications)}</Popover.Body>
        </Popover>
    );

    const eth = window.ethereum;
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    const networksList = networks; //props.customNetworksList ? props.customNetworksList : undefined;

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=UPPVCS8VTCCNT3T83BZ8H6YRE9WVDY6W2P'
        )
            .then((response) => response.json())
            .then((data) => {
                setGasPrice(data.result.ProposeGasPrice);
            })
            .catch((error) => {
                setGasPrice('n/a');
            });
    }, []);

    useEffect(() => {
        if (!account || !chainId) {
            return;
        }

        const loadNotifications = async () => {
            log('Notifications update started');

            let finishedNotification =
                JSON.parse(window.localStorage.getItem('FINISHED_NOTIFICATIONS') || '{}') || [];

            let deposits = await getTransactionHistory(
                account,
                'DEPOSIT',
                chainId,
                'DEPOSIT_WITHDRAW'
            );

            deposits = deposits.map((item: any) => {
                return { ...item, type: 'deposit' };
            });

            let withdrawals = await getTransactionHistory(
                account,
                'WITHDRAW',
                chainId,
                'DEPOSIT_WITHDRAW'
            );

            withdrawals = withdrawals.map((item: any) => {
                return { ...item, type: 'withdraw' };
            });

            // let mint = await getTransactionHistory(account, 'MINT', chainId, 'MINT');

            // mint = mint.map((item: any) => {
            //     return { ...item, type: 'mint' };
            // });

            const fullList = deposits.concat(withdrawals);

            if (!finishedNotification.length) {
                window.localStorage.setItem('FINISHED_NOTIFICATIONS', JSON.stringify(fullList));
            } else {
            }

            setNotifications(fullList);
        };

        loadNotifications();

        let refreshInterval = setInterval(loadNotifications, 60000);
        return () => clearInterval(refreshInterval);
    }, [account, chainId]);

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
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="bottom"
                        overlay={notificationsPopover}
                        show={showNotifications}
                    >
                        <button
                            className="btn btn-light btn-sm d-flex align-items-center"
                            ref={notificationsTarget}
                            onClick={() => setNotificationsState(!showNotifications)}
                        >
                            <svg
                                width="14"
                                height="15"
                                viewBox="0 0 14 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3.65152 12.4473C2.81022 12.4456 1.96894 12.4439 1.12764 12.4421C0.805142 12.4413 0.522557 12.3431 0.294388 12.105C0.19546 12.002 0.118449 11.8799 0.0680223 11.7463C0.0175954 11.6126 -0.00520567 11.4701 0.000996377 11.3274C0.00719843 11.1847 0.0422888 11.0447 0.10412 10.9159C0.165952 10.7871 0.253251 10.6722 0.360747 10.5782C1.08955 9.94138 1.57314 9.15957 1.74838 8.2023C1.79375 7.9455 1.81843 7.68547 1.82216 7.42472C1.83309 6.87356 1.82463 6.32203 1.82569 5.77065C1.82965 3.70536 3.24363 1.97388 5.27006 1.56225C5.84039 1.44934 6.42808 1.45758 6.99502 1.58646C7.01162 1.59277 7.02753 1.60078 7.04248 1.61036C6.5291 2.89516 6.55776 4.16246 7.23885 5.37742C7.91758 6.58816 8.97429 7.28298 10.3382 7.52579C10.3612 7.71689 10.3783 7.90971 10.4085 8.10043C10.557 9.03564 10.9891 9.81915 11.685 10.458C11.8686 10.6265 12.0417 10.7985 12.1207 11.0451C12.3445 11.7432 11.8298 12.4368 11.0751 12.4412C10.248 12.446 9.42083 12.4423 8.5937 12.4425C8.56999 12.4425 8.54627 12.4447 8.52256 12.4458L3.65152 12.4473Z"
                                    fill="black"
                                />
                                <path
                                    d="M10.9529 6.34896C9.27019 6.3486 7.90484 4.98309 7.9087 3.30445C7.91187 2.49697 8.23519 1.72371 8.80773 1.1543C9.38028 0.584891 10.1553 0.265825 10.9628 0.267094C11.7678 0.270269 12.5389 0.591686 13.1079 1.16123C13.6769 1.73077 13.9975 2.50221 13.9998 3.30725C13.9998 3.70711 13.9209 4.10303 13.7676 4.47238C13.6144 4.84172 13.3899 5.17724 13.1069 5.45974C12.8239 5.74224 12.488 5.96618 12.1184 6.11876C11.7488 6.27134 11.3527 6.34957 10.9529 6.34896Z"
                                    fill="black"
                                />
                                <path
                                    d="M3.65186 12.447L8.5229 12.4456C8.49244 13.6395 7.71194 14.582 6.55325 14.824C5.28063 15.0898 3.98918 14.2492 3.71224 12.9687C3.67541 12.7984 3.67118 12.6211 3.65186 12.447Z"
                                    fill="black"
                                />
                            </svg>
                        </button>
                    </OverlayTrigger>
                    <ThemeSwitcher />
                    <NetworkSelector
                        className="ms-0"
                        hideActiveNetwork={true}
                        autoChange={false}
                        customNetworksList={networksList}
                        onNetworkChange={(network: Network) => {
                            setActiveNetwork(network);
                        }}
                    />
                    <WalletButton />
                </div>
            </div>
        </Navbar>
    );
};
