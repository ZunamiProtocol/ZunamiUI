import { Col } from 'react-bootstrap';
import {LinkBlock} from '../LinkBlock/LinkBlock';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import './SideBar.scss';

interface SideBarProps {
    isMainPage: boolean;
}

export const SideBar = (props: SideBarProps): JSX.Element => {
    return (
        <Col xs={3} className={'SidebarColumn h-100 zun-shadow zun-rounded'}>                
            <div className={`Sidebar ${props.isMainPage === false ? 'SideBar_hide' : ''}`}>
                <LinkBlock title='Dashboard' description='' url={''} icon='/dashboard-icon.svg' />
                <LinkBlock title='Deposit' description='Click for deposit' url={'deposit'} icon='/deposit-icon.svg' vstyle='selected' />
                <LinkBlock title='Withdraw' description='Click for withdraw' url={'withdraw'} icon='/withdraw-icon.svg' vstyle='selected' />
                <ThemeSwitcher />
            </div>
            <div className={'SideBar__logo'}>
                <img src='/logo-footer.svg' alt='' />
            </div>
        </Col>
    );
};
