import { Col } from 'react-bootstrap';
import { LinkBlock } from '../LinkBlock/LinkBlock';
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
                    <LinkBlock
                        title="Dashboard"
                        description=""
                        url={''}
                        icon="/menu-dashboard.svg"
                    />
                    <LinkBlock
                        title="Deposit & Withdraw"
                        description="Click for deposit"
                        url={'deposit'}
                        icon="/menu-deposit-and-withdraw.svg"
                    />
                    <LinkBlock
                        title="Lockdrop"
                        description="Click for withdraw"
                        url={'lockdrop'}
                        icon="/menu-lockdrop.svg"
                        testnet={true}
                    />
                    <LinkBlock
                        title="Staking ZUN"
                        description="Click for withdraw"
                        url={'staking'}
                        icon="/menu-staking.svg"
                        testnet={true}
                    />
                    <LinkBlock
                        title="DAO"
                        description="Click for withdraw"
                        url={'https://snapshot.org/#/zunamidao.eth'}
                        icon="/menu-dao.svg"
                    />
                </div>
                <div className="Sidebar__footer">
                    <ThemeSwitcher />
                    <a href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing">
                        How to use?
                    </a>
                    <a href="https://www.zunami.io/#faq-main" target="_blank" rel="noreferrer">
                        FAQ
                    </a>
                </div>
            </div>
        </Col>
    );
};
