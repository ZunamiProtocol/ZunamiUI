import { Nav } from 'react-bootstrap';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './deposit-icon.svg';
import { ReactComponent as LockdropIcon } from './lockdrop-icon.svg';
import { ReactComponent as StakingIcon } from './staking-icon.svg';
import { ReactComponent as DaoIcon } from './dao-icon.svg';

export const NavMenu = (): JSX.Element => {
    const items = [
        {
            title: 'Dashboard',
            url: '/',
            icon: <DashboardIcon />,
        },
        {
            title: 'Deposit & Withdraw',
            url: '/deposit',
            icon: <DepositIcon />,
            disabled: true,
        },
        {
            title: 'Lockdrop',
            url: '/lockdrop',
            icon: <LockdropIcon />,
            disabled: true,
        },
        {
            title: 'Staking ZUN',
            url: '/staking',
            icon: <StakingIcon />,
            disabled: true,
        },
        {
            title: 'DAO',
            url: '/dao',
            icon: <DaoIcon />,
            disabled: true,
        },
    ];

    return (
        <Nav defaultActiveKey="/home" as="ul" className="NavMenu">
            {items.map((item) => (
                <Nav.Item
                    as="li"
                    key={item.url}
                    className={`${window.location.pathname === item.url ? 'selected' : ''}`}
                >
                    <Nav.Link href={item.url} className={`${item.disabled ? 'disabled' : ''}`}>
                        {item.icon}
                        <span>{item.title}</span>
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
};
