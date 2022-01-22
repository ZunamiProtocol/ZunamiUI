import {Col} from 'react-bootstrap';
import {LinkBlock} from '../LinkBlock/LinkBlock';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import './SideBar.scss';

interface SideBarProps {
    isMainPage: boolean;
}

export const SideBar = (props: SideBarProps): JSX.Element => {
    return (
        <Col className={'SidebarColumn'}>
            <div className="Sidebar">
                <div className={''}>
                    <WalletStatus />
                    <LinkBlock title='Dashboard' description='' url={''} icon='/menu-dashboard.svg' />
                    <LinkBlock title='Deposit & Withdraw' description='Click for deposit' url={'deposit-and-withdraw'} icon='/menu-deposit-and-withdraw.svg' />
                    <LinkBlock title='Lockdrop' description='Click for withdraw' url={'lockdrop'} icon='/menu-lockdrop.svg' />
                    <LinkBlock title='Staking ZUN' description='Click for withdraw' url={'staking'} icon='/menu-staking.svg' />
                    <LinkBlock title='DAO' description='Click for withdraw' url={'dao'} icon='/menu-dao.svg' />
                </div>
                <div className="Sidebar__footer">
                    <ThemeSwitcher/>
                    <a href="/how-to-use">How to use?</a>
                    <a href="/faq">FAQ</a>
                </div>
            </div>
        </Col>
    );
};
