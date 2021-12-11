import {Col} from 'react-bootstrap';
import {LinkBlock} from '../LinkBlock/LinkBlock';
import {ThemeSwitcher} from '../ThemeSwitcher/ThemeSwitcher';
import {Disclaimer} from '../Disclaimer/Disclaimer';
import './SideBar.scss';

interface SideBarProps {
    isMainPage: boolean;
}

export const SideBar = (props: SideBarProps): JSX.Element => {
    return (
        <Col xs={3} className={'SidebarColumn zun-shadow zun-rounded'}>
            <div className={`Sidebar ${props.isMainPage === false ? 'SideBar_hide' : ''}`}>
                <div className={'d-block d-lg-none'}>
                    <Disclaimer
                        text={'Please note. This is a beta version. The contract has not been auditied yet. Use it at your own risk.'}
                    />
                </div>
                {
                    window.location.pathname === '/' &&
                    <div className={'sm-menu one-row'}>
                        <LinkBlock title='Deposit' description='Click for deposit' url={'deposit'} icon='/deposit-icon.svg' vstyle='selected' />
                        <LinkBlock title='Withdraw' description='Click for withdraw' url={'withdraw'} icon='/withdraw-icon.svg' vstyle='selected' />
                    </div>
                }
                <div className={'d-none lg-menu'}>
                    <LinkBlock title='Dashboard' description='' url={''} icon='/dashboard-icon.svg' />
                    <LinkBlock title='Deposit' description='Click for deposit' url={'deposit'} icon='/deposit-icon.svg' vstyle='selected' />
                    <LinkBlock title='Withdraw' description='Click for withdraw' url={'withdraw'} icon='/withdraw-icon.svg' vstyle='selected' />
                </div>
                <ThemeSwitcher/>
            </div>
            <div className={'SideBar__logo'}>
                <img src="/logo-footer.svg" alt=""/>
            </div>
        </Col>
    );
};
