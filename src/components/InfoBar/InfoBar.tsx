import React from 'react';
import { Button } from 'react-bootstrap';
import useFetch from 'react-fetch-hook';
import { zunamiInfoUrl } from '../../api/api';
import './InfoBar.scss';
import { BigNumber } from 'bignumber.js';

interface InfoBarProps {
    // onClick: any;
}

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
    apr: number;
    monthlyAvgApy: number;
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

export const InfoBar = (props: InfoBarProps): JSX.Element => {
    const { isLoading: isZunLoading, data: zunData } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    return (
        <div className="card InfoBar">
            <div className="card-body">
                <div className="title">Info bar</div>
                <div className="values">
                    <div className="block">
                        <img src="/convex.svg" alt="" />
                        <div>
                            <span className="name">Default pool</span>
                            <span className="value">Convex finance USDD pool</span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Slippage rate</span>
                            <span className="value">~ 0.43%</span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Base APY</span>
                            <span className="value">
                                {isZunLoading
                                    ? 'n/a'
                                    : `${zunamiInfo.monthlyAvgApy.toPrecision(3)}%`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
