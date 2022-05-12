import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header/Header';
import { InfoBlock } from '../components/InfoBlock/InfoBlock';
import { SideBar } from '../components/SideBar/SideBar';
import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { Chart } from '../components/Chart/Chart';
import { PendingBalance } from '../components/PendingBalance/PendingBalance';
import { Container, Row, Col } from 'react-bootstrap';
import { getBalanceNumber } from '../utils/formatbalance';
import useLpPrice from '../hooks/useLpPrice';
import useUserLpAmount from '../hooks/useUserLpAmount';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import useFetch from 'react-fetch-hook';
import { getPoolStatsUrl, zunamiInfoUrl, getHistoricalApyUrl, getTotalIncomeUrl } from '../api/api';
import { BigNumber } from 'bignumber.js';

import usePendingOperations from '../hooks/usePendingOperations';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { WalletStatus } from '../components/WalletStatus/WalletStatus';

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
    apr: number;
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

    const pool = useFetch(getPoolStatsUrl('USDN,LUSD,ANCHOR'));
    const poolStats = pool.data as PoolsStats;
    const poolBestAprDaily = zunamiInfo ? zunamiInfo.apr / 100 / 365 : 0;
    const poolBestAprMonthly = zunamiInfo ? (zunamiInfo.apr / 100 / 365) * 30 : 0;
    const poolBestApyMonthly = zunamiInfo ? (zunamiInfo.apy / 100 / 365) * 30 : 0;
    const dailyProfit = getBalanceNumber(userMaxWithdraw).toNumber() * poolBestAprDaily;
    const monthlyProfit = getBalanceNumber(userMaxWithdraw).toNumber() * poolBestAprMonthly;
    const yearlyProfit = getBalanceNumber(userMaxWithdraw).toNumber() * poolBestApyMonthly * 12;

    const [totalIncome, setTotalIncome] = useState('n/a');

    useEffect(() => {
        if (!account || userLpAmount.toNumber() === -1) {
            return;
        }

        const getTotalIncome = async () => {
            const response = await fetch(
                getTotalIncomeUrl(account, userLpAmount.toNumber().toString())
            );

            const data = await response.json();
            setTotalIncome(`$${data.totalIncome}`);
        };

        getTotalIncome();
    }, [account, userLpAmount]);

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
            <Container className={'d-flex justify-content-between flex-column'}>
                <Row className={'main-row h-100'}>
                    <SideBar isMainPage={true} />

                    <Col className={'content-col dashboard-col'}>
                        <WalletStatus />
                        <ClickableHeader name="Dashboard" icon="dashboard" />
                        <div className={'first-row'}>
                            <InfoBlock
                                title="Balance"
                                description={
                                    userMaxWithdraw.toNumber() !== -1
                                        ? `$ ${getBalanceNumber(userMaxWithdraw)
                                              .toNumber()
                                              .toLocaleString('en')}`
                                        : 'n/a'
                                }
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                                hint={
                                    <span>
                                        Profit is accrued at least once a week, after the sale of
                                        the accumulated weekly rewards.
                                    </span>
                                }
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
                                description={totalIncome}
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                            />
                        </div>
                        <div className="second-row">
                            <InfoBlock
                                title="Profit"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            dailyProfit ? dailyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Daily</span>
                                    </div>
                                }
                                withColor={false}
                                isStrategy={false}
                            />
                            <InfoBlock
                                title="&nbsp;"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            monthlyProfit ? monthlyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Monthly</span>
                                    </div>
                                }
                                withColor={false}
                                isStrategy={false}
                            />
                            <InfoBlock
                                title="&nbsp;"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            yearlyProfit ? yearlyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Yearly</span>
                                    </div>
                                }
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
