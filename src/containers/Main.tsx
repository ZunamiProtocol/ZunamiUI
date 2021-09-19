import React from 'react';
import {Header} from '../components/Header/Header';
import {InfoBlock} from '../components/InfoBlock/InfoBlock';
import {SideBar} from '../components/SideBar/SideBar';
import './Main.scss';

export const Main = (): JSX.Element => {
    return (
        <div className={'MainContainer'}>
            <Header />
            <div className={'ContentBlock'}>
                <SideBar />
                <div className={'InfoContainer'}>
                    <InfoBlock
                        iconName='yes'
                        title='Already earned'
                        description='$ 0'
                        withColor={true}
                        isStrategy={false}
                    />
                    <InfoBlock
                        iconName='balance'
                        title='Balance'
                        description='$ 100 000'
                        withColor={true}
                        isStrategy={false}
                    />
                    <InfoBlock
                        iconName='lock'
                        title='Total Value Locked'
                        description='$ 100 000 000'
                        withColor={true}
                        isStrategy={false}
                    />
                    <InfoBlock title='APY' description='25%' withColor={false} isStrategy={false} />
                    <InfoBlock
                        title='Daily Profits'
                        description='68 USD/day'
                        withColor={false}
                        isStrategy={false}
                    />
                    <InfoBlock
                        title='Monthly Profits'
                        description='2040 USD/month'
                        withColor={false}
                        isStrategy={false}
                    />
                    <div className={'InfoContainer_long'}>
                        <InfoBlock
                            title='Current strategy'
                            description='Convex finance - USDP pool'
                            withColor={false}
                            isStrategy={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
