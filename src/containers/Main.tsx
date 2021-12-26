import React from 'react';
import {Header} from '../components/Header/Header';
import {InfoBlock} from '../components/InfoBlock/InfoBlock';
import {SideBar} from '../components/SideBar/SideBar';
import {ClickableHeader} from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { Chart } from '../components/Chart/Chart';
import {Container, Row, Col} from 'react-bootstrap';
import {BIG_ZERO, getBalanceNumber} from "../utils/formatbalance";
// import useLpPrice from "../hooks/useLpPrice";
import useUserLpAmount from "../hooks/useUserLpAmount";
import {useWallet} from "use-wallet";
import useEagerConnect from "../hooks/useEagerConnect";
import useFetch from "react-fetch-hook";
import {getPoolStatsUrl, zunamiInfoUrl} from "../api/api";
import {BigNumber} from "bignumber.js";

interface ZunamiInfo {
    tvl: BigNumber;
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface PoolStatsItem {
    type: string;
    apr: number;
    apy: number;
    pid: number;
}

interface PoolsStats {
    poolsStats: Array<PoolStatsItem>;
}

export const Main = (): JSX.Element => {
    // const lpPrice = useLpPrice();
    const lpPrice = new BigNumber(1); // TODO: fix
    const userLpAmount = useUserLpAmount();
    const userMaxWithdraw = (userLpAmount && lpPrice && userLpAmount.toNumber() > 0) ? lpPrice.multipliedBy(userLpAmount) : BIG_ZERO;
    const {account, connect, ethereum} = useWallet();
    useEagerConnect(account ? account : "", connect, ethereum);

    const {
        isLoading: isZunLoading,
        data: zunData,
        error: zunError
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const pool = useFetch(getPoolStatsUrl("OUSD,USDP"));
    const poolStats = pool.data as PoolsStats;
    const poolBestApy = (poolStats && poolStats.poolsStats) ? poolStats.poolsStats[0].apy : 0;
    const poolBestAprDaily = (poolStats && poolStats.poolsStats) ? poolStats.poolsStats[0].apr / 100 / 365 : 0;
    const poolBestAprMonthly = (poolStats && poolStats.poolsStats) ? poolStats.poolsStats[0].apr / 100 / 365 * 30 : 0;
    const dailyProfit = getBalanceNumber(userMaxWithdraw) * poolBestAprDaily;
    const monthlyProfit = getBalanceNumber(userMaxWithdraw) * poolBestAprMonthly;

    const chartData = [
        { title: 'Convex finance - OUSD pool', value: 70, color: '#F64A00' },
        { title: 'Convex finance - USDP pool', value: 30, color: '#B8E654' },
    ];

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header/>
            <Row className={'mt-3 h-100 mb-4 main-row'}>
                <SideBar isMainPage={true}/>
                <Col className={'content-col dashboard-col'}>
                    <ClickableHeader name={'Dashboard'} icon={'/section-withdraw-bg.svg'} />
                    <Row className={'zun-rounded zun-shadow ms-0 me-0'}>
                        <Col className={'AlreadyEarnedCol'}>
                            <InfoBlock
                                iconName="yes"
                                title="Already earned"
                                description="$ 0"
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col className={'BalanceCol'}>
                            <InfoBlock
                                iconName="balance"
                                title="Balance"
                                description={`$ ${getBalanceNumber(userMaxWithdraw).toLocaleString("en")}`}
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col xs={12} sm={4} lg={4} className={'TvlCol'}>
                            <InfoBlock
                                iconName="lock"
                                title="Value Locked"
                                description={`${(zunamiInfo && !zunError ? `$${getBalanceNumber(zunamiInfo.tvl).toLocaleString("en")}` : 'n/a')}`}
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0 mt-3'}>
                        <Col className={'ApyCol'}>
                            <InfoBlock
                                title="APY"
                                description={`${poolBestApy.toFixed(2)}%`}
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col className={'DailyProfitCol'}>
                            <InfoBlock
                                title="Daily Profits"
                                description={`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD/day`}
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col xs={12} sm={4} lg={4} className={'MonthlyProfitCol'}>
                            <InfoBlock
                                title="Monthly Profits"
                                description={`${monthlyProfit ? monthlyProfit.toFixed(2) : 0} USD/month`}
                                withColor={false}
                                isStrategy={false}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0'}>
                        <Col className={'CurrStrategyCol'}>
                            <Chart data={chartData} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
