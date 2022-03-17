import { useState } from 'react';
import './Header.scss';
import { Navbar } from 'react-bootstrap';
import { Disclaimer } from '../Disclaimer/Disclaimer';

export const Header = (): JSX.Element => {
    const logoVariant = document.body.classList.contains('dark') ? 'logo-dark.svg' : 'logo.svg';
    const [open, setOpen] = useState(false);

    return (
        <Navbar expand="lg" className={'header'}>
            <Navbar.Brand href="https://zunami.io">
                <img className={'Logo'} src={logoVariant} alt="Logo of the Zunami Protocol" />
            </Navbar.Brand>
            <Disclaimer
                text={
                    <div>
                        Please note. The contract{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://github.com/ZunamiLab/ZunamiProtocol/tree/main/audit"
                        >
                            has been audited
                        </a>
                        , but it steel a beta version. Use it at your own risk
                    </div>
                }
            />
            <div
                className="nav-menu"
                onClick={() => {
                    setOpen(!open);
                    document.getElementsByClassName('SidebarColumn')[0].classList.toggle('active');
                    document.body.classList.toggle('overflow');
                }}
            >
                {open && (
                    <svg
                        width="21"
                        height="21"
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1 19.3848L19.3848 0.99999"
                            stroke="#F95A05"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M1 1L19.3848 19.3848"
                            stroke="#F95A05"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
                {!open && (
                    <svg
                        width="35"
                        height="10"
                        viewBox="0 0 35 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M13.2793 9L34.0002 9"
                            stroke="#F95A05"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path d="M1 1H34" stroke="#F95A05" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}
            </div>
        </Navbar>
    );
};
