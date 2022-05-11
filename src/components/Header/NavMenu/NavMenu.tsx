import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './deposit-icon.svg';
import { ReactComponent as LockdropIcon } from './lockdrop-icon.svg';
import { ReactComponent as StakingIcon } from './staking-icon.svg';
import { ReactComponent as DaoIcon } from './dao-icon.svg';

export const NavMenu = (): JSX.Element => {
    const history = useHistory();
    const items = [
        {
            title: 'Dashboard',
            urls: ['/'],
            icon: <DashboardIcon />,
        },
        {
            title: 'Deposit & Withdraw',
            urls: ['/deposit', '/withdraw'],
            icon: <DepositIcon />,
        },
        {
            title: 'Lockdrop',
            urls: ['/lockdrop'],
            icon: <LockdropIcon />,
            disabled: true,
        },
        {
            title: 'Staking ZUN',
            urls: ['/staking'],
            icon: <StakingIcon />,
            disabled: true,
        },
        {
            title: 'DAO',
            urls: ['https://snapshot.org/#/zunamidao.eth'],
            icon: <DaoIcon />,
        },
    ];

    const onClick = (e: any) => {
        e.preventDefault();
        history.push(new URL(e.currentTarget.href).pathname);
    };

    const activeElementTitle = items.filter(
        (el) => el.urls.indexOf(history.location.pathname) !== -1
    )[0].title;

    return (
        <Navbar.Collapse id="nav-menu">
            <Nav defaultActiveKey="/home" as="ul" className="NavMenu">
                {items.map((item) => (
                    <Nav.Item
                        as="li"
                        key={item.title}
                        className={`${
                            item.urls.indexOf(window.location.pathname) !== -1 ? 'selected' : ''
                        }`}
                    >
                        <Nav.Link
                            href={item.urls[0]}
                            className={`${item.disabled ? 'disabled' : ''}`}
                            onClick={onClick}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </Nav.Link>
                    </Nav.Item>
                ))}
                <NavDropdown title={activeElementTitle} id="collapsed-nav-menu">
                    {items
                        .filter((el) => el.title !== activeElementTitle)
                        .map((item) => (
                            <NavDropdown.Item
                                href={item.urls[0]}
                                onClick={onClick}
                                key={item.title}
                                className={`${item.disabled ? 'disabled' : ''}`}
                            >
                                {item.icon}
                                <span>{item.title}</span>
                            </NavDropdown.Item>
                        ))}
                </NavDropdown>
            </Nav>
        </Navbar.Collapse>
    );
};
