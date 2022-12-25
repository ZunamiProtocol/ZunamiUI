import { useState } from 'react';
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
    const { chainId } = useWallet();

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
                            width="17"
                            height="15"
                            viewBox="0 0 17 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.2913 2.39175H5.14711C4.0292 2.39175 3.11514 3.28473 3.11514 4.38861V6.16949C3.11514 7.27336 4.02919 8.16643 5.14711 8.16643H7.2913C8.40922 8.16643 9.32328 7.27336 9.32328 6.16949V4.38861C9.32328 3.28473 8.40922 2.39175 7.2913 2.39175ZM8.39667 6.16949C8.39667 6.76334 7.90336 7.25151 7.2913 7.25151H5.14711C4.53505 7.25151 4.04175 6.76334 4.04175 6.16949V4.38861C4.04175 3.79478 4.53504 3.30667 5.14711 3.30667H7.2913C7.90338 3.30667 8.39667 3.79478 8.39667 4.38861V6.16949Z"
                                fill="black"
                                stroke="black"
                                strokeWidth="0.3"
                            />
                            <path
                                d="M13.1041 3.0477L13.1041 3.04766C13.1973 2.81104 13.4659 2.69673 13.702 2.78637C14.5002 3.089 15.1136 3.5077 15.5275 4.04521C15.9426 4.5843 16.1491 5.23278 16.1494 5.97925V5.97929V11.3734C16.1624 11.8225 15.9753 12.2647 15.6379 12.5786L15.6379 12.5786C15.3445 12.8515 14.9639 13.0044 14.5768 13.0044C14.5371 13.0044 14.4975 13.0028 14.4577 12.9995C14.4577 12.9995 14.4577 12.9995 14.4577 12.9995L14.4699 12.85C13.7239 12.789 13.1466 12.1169 13.1829 11.352L13.1041 3.0477ZM13.1041 3.0477C13.0104 3.28571 13.1322 3.55041 13.3698 3.6405L13.1041 3.0477ZM13.0326 8.55274L13.0329 11.3485L13.3698 3.64051C14.0088 3.88276 14.47 4.19634 14.7717 4.58011C15.0717 4.96178 15.2226 5.42384 15.2228 5.98103C15.2228 5.98104 15.2228 5.98106 15.2228 5.98107L15.2229 11.3848H15.2228L15.223 11.3894C15.2289 11.5854 15.149 11.7764 15.0025 11.9127C14.8655 12.0401 14.6939 12.1007 14.5341 12.0877C14.2166 12.0617 13.9416 11.7472 13.959 11.3733L13.9592 11.3733V11.3663L13.9592 8.5515L13.9592 8.55107C13.9582 8.20767 13.8775 7.33074 13.1449 6.60106C12.6118 6.07017 11.9902 5.88043 11.5888 5.81288V3.38953C11.5888 1.67951 10.1722 0.293359 8.43673 0.293359H4.00211C2.2666 0.293359 0.85 1.67951 0.85 3.38953V10.7995C0.85 12.5094 2.26661 13.8956 4.00211 13.8956H8.43673C10.1722 13.8956 11.5888 12.5094 11.5888 10.7995V6.74668C11.8521 6.81169 12.1908 6.9504 12.4868 7.24523L12.4868 7.24523C12.9903 7.74673 13.0321 8.37446 13.0326 8.55274ZM10.6622 10.8015C10.6611 12.0005 9.6657 12.9807 8.43673 12.9807H4.00211C2.77245 12.9807 1.77661 11.9994 1.77661 10.7995V3.38953C1.77661 2.18955 2.77245 1.20828 4.00211 1.20828H8.43673C9.66639 1.20828 10.6622 2.18955 10.6622 3.38953V10.7995C10.6622 10.8002 10.6622 10.8009 10.6622 10.8015Z"
                                fill="black"
                                stroke="black"
                                strokeWidth="0.3"
                            />
                        </svg>
                        <span className="ms-2">$120</span>
                    </button>
                    <button className="btn btn-light btn-sm d-flex align-items-center">
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
                                fill="#FF8B02"
                            />
                            <path
                                d="M3.65186 12.447L8.5229 12.4456C8.49244 13.6395 7.71194 14.582 6.55325 14.824C5.28063 15.0898 3.98918 14.2492 3.71224 12.9687C3.67541 12.7984 3.67118 12.6211 3.65186 12.447Z"
                                fill="black"
                            />
                        </svg>
                    </button>
                    <ThemeSwitcher />
                    <button type="button" className="btn btn-sm btn-outline-dark">
                        All services
                    </button>
                </div>
            </div>
        </Navbar>
    );
};
