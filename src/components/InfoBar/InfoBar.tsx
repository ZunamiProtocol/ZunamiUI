import useFetch from 'react-fetch-hook';
import { getActiveStratsUrl, zunamiInfoUrl } from '../../api/api';
import './InfoBar.scss';
import { BigNumber } from 'bignumber.js';
import useSushi from '../../hooks/useSushi';
import { useEffect, useState } from 'react';
import useWallet from '../../hooks/useWallet';
import { PoolInfo, poolsChartdata } from '../../functions/pools';

interface InfoBarProps {
    // onClick: any;
    slippage?: string | undefined;
    section?: string;
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

interface PoolsStats {
    pools: Array<PoolInfo>;
}

export const InfoBar = (props: InfoBarProps): JSX.Element => {
    const sushi = useSushi();
    const { account, chainId } = useWallet();
    const { isLoading: isZunLoading, data: zunData } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;
    const zunamiInfo = zunData as ZunamiInfo;
    
    const { data: activeStratsStat } = useFetch(getActiveStratsUrl());
    const poolStat = activeStratsStat as PoolsStats;
    const [defaultPool, setDefautPool] = useState<PoolInfo>();

    useEffect(() => {
        if (!account || !chainId || !poolStat) {
            return;
        }

        const contract = sushi.getEthContract();

        const getDefaultPool = async () => {
            const defaultPoolId =
                props.section === 'withdraw'
                    ? await contract.methods.defaultWithdrawPid().call()
                    : await contract.methods.defaultDepositPid().call();
            const pool = poolStat.pools.filter((item) => item.pid === parseInt(defaultPoolId, 10));

            if (pool.length) {
                const poolInfo = poolsChartdata[pool[0].type];
                setDefautPool(poolInfo);
            }
            // debugger;
        };

        getDefaultPool();
    }, [chainId, account, poolStat, props.section, sushi]);
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
                                    : `${zunamiInfo.monthlyAvgApy.toPrecision(3)}%`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
