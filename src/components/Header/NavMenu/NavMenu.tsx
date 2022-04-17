import { useState } from 'react';
import { Nav } from 'react-bootstrap';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './dashboard-icon.svg';
import { ReactComponent as LockdropIcon } from './dashboard-icon.svg';
import { ReactComponent as StakingIcon } from './dashboard-icon.svg';
import { ReactComponent as DaoIcon } from './dashboard-icon.svg';

export const NavMenu = (): JSX.Element => {
    const items = [
        {
            title: 'Dashboard',
            url: '/',
            icon: DashboardIcon,
        },
        {
            title: 'Deposit',
            url: '/deposit',
            icon: DepositIcon,
        },
        {
            title: 'Lockdrop',
            url: '/lockdrop',
            icon: LockdropIcon,
            disabled: true,
        },
        {
            title: 'Staking',
            url: '/staking',
            icon: StakingIcon,
            disabled: true,
        },
        {
            title: 'DAO',
            url: '/dao',
            icon: DaoIcon,
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
                        <span>{item.title}</span>
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
};
