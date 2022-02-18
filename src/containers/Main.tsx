import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header/Header';
import { InfoBlock } from '../components/InfoBlock/InfoBlock';
import { SideBar } from '../components/SideBar/SideBar';
import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { Chart } from '../components/Chart/Chart';
import { PendingBalance } from '../components/PendingBalance/PendingBalance';
import { Container, Row, Col } from 'react-bootstrap';
import { BIG_ZERO, getBalanceNumber } from '../utils/formatbalance';
// import useLpPrice from "../hooks/useLpPrice";
import useUserLpAmount from '../hooks/useUserLpAmount';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import useFetch from 'react-fetch-hook';
import { getPoolStatsUrl, zunamiInfoUrl, getHistoricalApyUrl } from '../api/api';
import { BigNumber } from 'bignumber.js';

import usePendingDeposit from '../hooks/usePendingDeposit';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { WelcomeCarousel } from '../components/WelcomeCarousel/WelcomeCarousel';
import { WalletStatus } from '../components/WalletStatus/WalletStatus';

interface ZunamiInfo {
    tvl: BigNumber;
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface PoolsStats {
    poolsStats: Array<PoolInfo>;
}

export const Main = (): JSX.Element => {
    // const lpPrice = useLpPrice();
    const lpPrice = new BigNumber(1); // TODO: fix
    const userLpAmount = useUserLpAmount();
    const userMaxWithdraw =
        userLpAmount && lpPrice && userLpAmount.toNumber() > 0
            ? lpPrice.multipliedBy(userLpAmount)
            : BIG_ZERO;
    const { account, connect, ethereum } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);

    const {
        isLoading: isZunLoading,
        data: zunData,
        error: zunError,
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const pool = useFetch(getPoolStatsUrl('OUSD,USDP'));
    const poolStats = pool.data as PoolsStats;
    const poolBestApy = poolStats && poolStats.poolsStats ? poolStats.poolsStats[0].apy : 0;
    const poolBestAprDaily =
        poolStats && poolStats.poolsStats ? poolStats.poolsStats[0].apr / 100 / 365 : 0;
    const poolBestAprMonthly =
        poolStats && poolStats.poolsStats ? (poolStats.poolsStats[0].apr / 100 / 365) * 30 : 0;
    const dailyProfit = getBalanceNumber(userMaxWithdraw) * poolBestAprDaily;
    const monthlyProfit = getBalanceNumber(userMaxWithdraw) * poolBestAprMonthly;

    const chartData =
        poolStats && poolStats.poolsStats && zunamiInfo
            ? poolDataToChartData(poolStats.poolsStats, zunamiInfo.tvl)
            : [];

    const [histApyPeriod, setHistApyPeriod] = useState('week');
    const [histApyData, setHistApyData] = useState([]);

    useEffect(() => {
        console.log(histApyPeriod);
        fetch(getHistoricalApyUrl(histApyPeriod))
            .then((response) => {
                return response.json();
            })
            .then((items) => {
                setHistApyData(items.data);
            });
    }, [histApyPeriod]);

    const pendingDepositSum = new BigNumber(100); //usePendingDeposit();
    const pdElement = (
        <div className="d-flex">
            <PendingBalance
                val={`PD: $${pendingDepositSum}`}
                hint={`You have $${pendingDepositSum} in pending deposit`}
            />
            <PendingBalance
                val={`PW: $${50}`}
                hint={`You have $${pendingDepositSum} in pending withdraw`}
            />
        </div>
    );

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header />
            <Row className={'h-100 mb-4 main-row'}>
                <SideBar isMainPage={true} />
                {!account && (
                    <Col className={'content-col dashboard-col'}>
                        <WelcomeCarousel />
                    </Col>
                )}
                {account && (
                    <Col className={'content-col dashboard-col'}>
                        <WalletStatus />
                        <div className={'first-row'}>
                            <InfoBlock
                                title="Balance"
                                description={`$ ${getBalanceNumber(userMaxWithdraw).toLocaleString(
                                    'en'
                                )}`}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                            />
                            <InfoBlock
                                title="APY"
                                description={`${poolBestApy.toFixed(2)}%`}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                                hint="Annual Percentage Yield. Сumulative yield from all strategies used &amp; includes 10% management fee"
                            />
                            <InfoBlock
                                title="Total Value Locked"
                                description={`${
                                    zunamiInfo && !zunError
                                        ? `$${getBalanceNumber(zunamiInfo.tvl).toLocaleString(
                                              'en'
                                          )}`
                                        : 'n/a'
                                }`}
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                            />
                        </div>
                        <div className="second-row">
                            <InfoBlock
                                title="Pending Deposits / Withdraws"
                                withColor={false}
                                isStrategy={false}
                                hint="Funds passing through the Transaction Streamlining Mechanism and will be credited within 24 hours"
                                secondaryRow={
                                    pendingDepositSum.toNumber() > 0 ? pdElement : undefined
                                }
                            />
                            <InfoBlock
                                title="Daily Profits"
                                description={`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD/day`}
                                withColor={false}
                                isStrategy={false}
                            />
                            <InfoBlock
                                title="Monthly Profits"
                                description={`${
                                    monthlyProfit ? monthlyProfit.toFixed(2) : 0
                                } USD/month`}
                                withColor={false}
                                isStrategy={false}
                            />
                        </div>
                        <div className="third-row">
                            <div className="strats-chart-col">
                                <Chart data={chartData} />
                            </div>
                            <div className="hist-apy-col">
                                <ApyChart
                                    data={histApyData}
                                    onRangeChange={(range: string) => {
                                        setHistApyPeriod(range);
                                    }}
                                />
                            </div>
                        </div>
                    </Col>
                )}
            </Row>
            <footer>
                <span className="copyright">© 2022 Zunami Protocol. Beta version 1.1</span>
            </footer>
        </Container>
    );
};
