import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './NavMenu.scss';
import { ReactComponent as DashboardIcon } from './dashboard-icon.svg';
import { ReactComponent as DepositIcon } from './deposit-icon.svg';
import { ReactComponent as DaoIcon } from './dao-icon.svg';
import { ReactComponent as UzdIcon } from './uzd-icon.svg';

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
            title: 'UZD Stablecoin',
            urls: ['/uzd'],
            icon: <UzdIcon />,
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
                            {/* <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.6249 8.6249L8.74515 8.50477C9.66236 7.58881 10.3868 6.86533 10.5187 6.06608C10.564 5.78361 10.5441 5.49452 10.4603 5.22098C10.3467 4.81592 10.129 4.52585 9.93685 4.26981L9.92142 4.24926C9.74423 4.01702 9.55077 3.79765 9.34251 3.59281L7.9072 2.1575C7.70236 1.94924 7.48299 1.75578 7.25075 1.57859L7.2302 1.56317C6.97416 1.37099 6.6841 1.1533 6.27904 1.0397C6.00549 0.955953 5.71639 0.935963 5.43392 0.981265C4.63468 1.11318 3.9112 1.83765 2.99524 2.75486L2.8751 2.87512L2.75485 2.99525C1.83763 3.91122 1.11316 4.6347 0.981255 5.43394C0.935957 5.71641 0.955941 6.00549 1.03968 6.27903C1.15327 6.68412 1.37097 6.97416 1.56315 7.2302L1.57858 7.25076C1.75577 7.483 1.94923 7.70237 2.15749 7.90721L3.5928 9.34252C3.79764 9.55078 4.01701 9.74424 4.24925 9.92143L4.2698 9.93685C4.52585 10.129 4.81589 10.3467 5.22098 10.4603C5.49452 10.5441 5.78361 10.5641 6.06607 10.5188C6.86531 10.3868 7.5888 9.66238 8.50476 8.74516L8.6249 8.6249Z" fill="#FB7501"/>
                            </svg> */}
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
