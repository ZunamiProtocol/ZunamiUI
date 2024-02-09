import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './deposit-icon.svg';
import { ReactComponent as DaoIcon } from './dao-icon.svg';
import { ReactComponent as UzdIcon } from './uzd-icon.svg';
import { ReactComponent as EarnIcon } from './earn.svg';

interface NavMenuProps {
    onSelect?: Function;
}

export const MenuItems = [
    {
        title: 'Dashboard',
        urls: ['/'],
        icon: <DashboardIcon />,
        mobileIcon: '/dashboard.png',
        disabled: false,
    },
    {
        title: 'zunStables',
        urls: ['/zun-stables'],
        icon: <UzdIcon />,
        mobileIcon: '/uzd.png',
        disabled: false,
    },
    {
        title: 'ZUN Staking',
        urls: ['/zun'],
        icon: <UzdIcon />,
        mobileIcon: '/zun-staking.png',
        disabled: true,
    },

    {
        title: 'Earn',
        urls: ['/earn'],
        icon: <EarnIcon />,
        mobileIcon: '/earn.png',
        disabled: true,
    },
    {
        title: 'DAO',
        urls: ['https://snapshot.org/#/zunamidao.eth'],
        icon: <DaoIcon />,
        mobileIcon: '/dao.png',
        disabled: false,
    },
];

export function renderMobileMenu() {
    return MenuItems.map((item) => (
        <a
            href={item.urls[0]}
            key={item.title}
            className={`text-center d-flex flex-column text-decoration-none ${
                window.location.pathname === item.urls[0] ? 'selected' : ''
            } ${item.disabled ? 'disabled' : ''}`}
        >
            <img src={item.mobileIcon} alt="" />
            <span className="text-muted mt-2">{item.title}</span>
        </a>
    ));
}

export const NavMenu = (props: NavMenuProps): JSX.Element => {
    const navigate = useNavigate();

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

        navigate(new URL(url).pathname);
    };

    const activeElement = MenuItems.filter(
        (el) => el.urls.indexOf(window.location.pathname) !== -1
    )[0];

    const activeElementTitle = activeElement.title;

    return (
        <Navbar.Collapse id="nav-menu">
            <Nav defaultActiveKey="/home" as="ul" className="NavMenu">
                {MenuItems.map((item) => (
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
                            {item.urls.indexOf(window.location.pathname) !== -1 && (
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9.16016 9.18679L9.30182 9.04526C10.3823 7.96624 11.2358 7.11395 11.3912 6.1724C11.4445 5.83965 11.421 5.4991 11.3223 5.17686C11.1885 4.69968 10.9321 4.35796 10.7057 4.05634L10.6875 4.03214C10.4788 3.75855 10.2509 3.50012 10.0055 3.25881L8.31469 1.56798C8.07338 1.32263 7.81496 1.09473 7.54137 0.885994L7.51716 0.867832C7.21554 0.641439 6.87384 0.384988 6.39666 0.25117C6.07441 0.152512 5.73384 0.128963 5.40108 0.18233C4.45955 0.33773 3.60727 1.19118 2.52824 2.27169L2.38671 2.41335L2.24506 2.55488C1.16454 3.63391 0.311089 4.48619 0.155699 5.42773C0.102336 5.76048 0.125878 6.10103 0.22452 6.42327C0.358339 6.90049 0.61479 7.24215 0.841193 7.54378L0.859365 7.568C1.0681 7.84159 1.296 8.10002 1.54134 8.34133L3.23218 10.0322C3.47349 10.2775 3.73192 10.5054 4.00551 10.7141L4.02972 10.7323C4.33135 10.9587 4.67302 11.2152 5.15023 11.349C5.47247 11.4476 5.81303 11.4712 6.14577 11.4178C7.08731 11.2624 7.9396 10.409 9.01863 9.32845L9.16016 9.18679Z"
                                        fill="#FD8D01"
                                    />
                                </svg>
                            )}
                            <span>{item.title}</span>
                        </Nav.Link>
                    </Nav.Item>
                ))}
                <NavDropdown
                    title={
                        <div>
                            {/* {activeElement.icon} */}
                            <span>&nbsp;{activeElement.title}</span>
                        </div>
                    }
                    id="collapsed-nav-menu"
                >
                    {MenuItems.filter((el) => el.title !== activeElementTitle).map((item) => (
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
