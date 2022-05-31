import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './deposit-icon.svg';
import { ReactComponent as DaoIcon } from './dao-icon.svg';

interface NavMenuProps {
    onSelect?: Function;
}

export const NavMenu = (props: NavMenuProps): JSX.Element => {
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
            title: 'DAO',
            urls: ['https://snapshot.org/#/zunamidao.eth'],
            icon: <DaoIcon />,
        },
    ];

    const onClick = (e: any) => {
        const url = e.currentTarget.href;
        e.preventDefault();

        if (props.onSelect) {
            props.onSelect();
        }

        if (url.indexOf(window.location.hostname) === -1) {
            window.open(url, '_blank');
            return;
        }

        history.push(new URL(url).pathname);
    };

    const activeElement = items.filter(
        (el) => el.urls.indexOf(history.location.pathname) !== -1
    )[0];

    const activeElementTitle = activeElement.title;

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
                <NavDropdown
                    title={
                        <div>
                            {activeElement.icon}
                            <span>&nbsp;{activeElement.title}</span>
                        </div>
                    }
                    id="collapsed-nav-menu"
                >
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
