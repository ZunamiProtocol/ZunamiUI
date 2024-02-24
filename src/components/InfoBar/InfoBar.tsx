import useFetch from 'react-fetch-hook';
import { getZunUsdApsStratsUrl, uzdStakingInfoUrl } from '../../api/api';
import './InfoBar.scss';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';
import { PoolInfo, poolsChartdata } from '../../functions/pools';
import { useAccount, useNetwork } from 'wagmi';

interface InfoBarProps {
    // onClick: any;
    slippage?: string | undefined;
    section?: string;
}

interface ZunamiInfo {
    info: {
        aps: {
            apy: number;
            apr: number;
            tvl: BigNumber;
        };
        omnipool: {
            tvl: BigNumber;
            apy: number;
            apr: number;
            monthlyAvgApy: number;
        };
        tvl: BigNumber;
    };
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface PoolsStats {
    pools: Array<PoolInfo>;
}

export const InfoBar = (props: InfoBarProps): JSX.Element => {
    const { address: account, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : 1;

    const { isLoading: isZunLoading, data: zunData } = useFetch(
        uzdStakingInfoUrl
    ) as ZunamiInfoFetch;
    const zunamiInfo = zunData as ZunamiInfo;

    const { data: activeStratsStat } = useFetch(getZunUsdApsStratsUrl());
    const poolStat = activeStratsStat as PoolsStats;
    const [defaultPool, setDefautPool] = useState<PoolInfo>();

    const poolInfo = poolsChartdata[poolStat.pools[0].type];
    setDefautPool(poolInfo);

    return (
        <div className="card InfoBar">
            <div className="card-body">
                <div className="title">Info bar</div>
                <div className="values">
                    <div className="block">
                        <img src={defaultPool ? defaultPool.icon : ''} alt="" />
                        <div>
                            <span className="name">Default pool</span>
                            <span className="value">{defaultPool ? defaultPool.title : 'n/a'}</span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Slippage rate</span>
                            <span
                                className={`value vela-sans text-${
                                    Number(props.slippage) >= 0.4 ? 'danger' : 'success'
                                }`}
                            >
                                {props.slippage ? `${props.slippage}%` : '0%'}
                            </span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Base APY</span>
                            <span className="value vela-sans">
                                {isZunLoading
                                    ? 'n/a'
                                    : `${zunamiInfo.info.omnipool.monthlyAvgApy.toPrecision(3)}%`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
