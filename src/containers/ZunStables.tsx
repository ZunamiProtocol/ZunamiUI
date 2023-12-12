import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ZunStables.scss';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SideBar, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import { Header } from '../components/Header/Header';
import { SidebarTopButtons } from '../components/SidebarTopButtons/SidebarTopButtons';

export const ZunStables = (): JSX.Element => {
    const apyHintTarget = useRef(null);
    const [showApyHint, setShowApyHint] = useState(false);
    const [tvl, setTvl] = useState('0');

    return (
        <React.Fragment>
            <MobileSidebar />
            <AllServicesPanel />
            <div className="container">
                <div className="row main-row h-100 UzdContainer">
                    <SideBar isMainPage={false} tvl={tvl}>
                        <SidebarTopButtons />
                        <div className="row">
                            <div className="col sidebar-links mt-3 d-none d-xxl-flex"></div>
                        </div>
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header section="uzd" />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
