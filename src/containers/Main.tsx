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
import useLpPrice from '../hooks/useLpPrice';
import useUserLpAmount from '../hooks/useUserLpAmount';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import useFetch from 'react-fetch-hook';
import { getPoolStatsUrl, zunamiInfoUrl, getHistoricalApyUrl } from '../api/api';
import { BigNumber } from 'bignumber.js';

import usePendingOperations from '../hooks/usePendingOperations';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { WelcomeCarousel } from '../components/WelcomeCarousel/WelcomeCarousel';
import { WalletStatus } from '../components/WalletStatus/WalletStatus';
import { ThemeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher';

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
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
    const lpPrice = useLpPrice();
    const userLpAmount = useUserLpAmount();
    const userMaxWithdraw =
        lpPrice.toNumber() !== -1 && userLpAmount.toNumber() !== -1
            ? lpPrice.multipliedBy(userLpAmount)
            : new BigNumber(-1);

    const { account, connect, ethereum } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);

    const {
        isLoading: isZunLoading,
        data: zunData,
        error: zunError,
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const pool = useFetch(getPoolStatsUrl('USDN,LUSD'));
    const poolStats = pool.data as PoolsStats;
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
        fetch(getHistoricalApyUrl(histApyPeriod))
            .then((response) => {
                return response.json();
            })
            .then((items) => {
                setHistApyData(items.data);
            });
    }, [histApyPeriod]);

    const pendingOperations = usePendingOperations();

    const pdElement = (
        <div className="d-flex">
            <PendingBalance
                val={`PD: $${getBalanceNumber(pendingOperations.deposit, 6)}`}
                hint={`You have $${pendingOperations.deposit} in pending deposit`}
            />
            <PendingBalance
                val={`PW: $${getBalanceNumber(pendingOperations.withdraw).toFixed(2)}`}
                hint={`You have $${pendingOperations.withdraw} in pending withdraw`}
            />
        </div>
    );

    return (
        <React.Fragment>
            <Header />
            <Container className={'h-100 d-flex justify-content-between flex-column'}>
                <Row className={'h-100 mb-4 main-row'}>
                    <SideBar isMainPage={true} />

                    <Col className={'content-col dashboard-col'}>
                        <WalletStatus />
                        <ClickableHeader name="Dashboard" icon="dashboard" />
                        <div className={'first-row'}>
                            <InfoBlock
                                title="Balance"
                                description={
                                    userMaxWithdraw.toNumber() !== -1
                                        ? `$ ${getBalanceNumber(userMaxWithdraw).toLocaleString(
                                              'en'
                                          )}`
                                        : 'n/a'
                                }
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                                hint="Profit is accrued at least once a week, after the sale of the accumulated weekly rewards."
                            />
                            <InfoBlock
                                title="Pending Deposits / Withdraws"
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                                secondaryRow={pdElement}
                            />
                            <InfoBlock
                                title="Total Income"
                                description="$12 000"
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
                                secondaryRow={pdElement}
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
                </Row>
            </Container>
        </React.Fragment>
    );
};
