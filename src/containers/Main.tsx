import React from 'react';
import {Header} from '../components/Header/Header';
import {InfoBlock} from '../components/InfoBlock/InfoBlock';
import {SideBar} from '../components/SideBar/SideBar';
import {ClickableHeader} from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import {Container, Row, Col} from 'react-bootstrap';
import {BIG_ZERO, getBalanceNumber} from "../utils/formatbalance";
import useLpPrice from "../hooks/useLpPrice";
import useUserLpAmount from "../hooks/useUserLpAmount";
import {useTotalHoldings} from "../hooks/zunamiMethods";
import {useWallet} from "use-wallet";
import useEagerConnect from "../hooks/useEagerConnect";
import useFetch from "react-fetch-hook";
import {getPoolStatsUrl, zunamiInfoUrl} from "../api/api";

interface ZunamiInfo {
    tvl: number;
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

    const lpPrice = useLpPrice();
    const userLpAmount = useUserLpAmount();
    const totalHoldings = useTotalHoldings();
    const userMaxWithdraw = lpPrice.multipliedBy(userLpAmount) || BIG_ZERO;
    // TODO: check withdraw amount after deposit
    const {account, connect, ethereum} = useWallet();
    useEagerConnect(account ? account : "", connect, ethereum);

    const zunami = useFetch(zunamiInfoUrl);
    const zunamiInfo = zunami.data as ZunamiInfo;
    console.log(zunamiInfo);

    const pool = useFetch(getPoolStatsUrl("OUSD,USDP"));
    const poolStats = pool.data as PoolsStats;
    console.log(poolStats);

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header/>
            <Row className={'mt-3 h-100 mb-4 main-row'}>
                <SideBar isMainPage={true}/>
                <Col className={'content-col dashboard-col'}>
                    <ClickableHeader name={'Dashboard'}/>
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
                                title="Total Value Locked"
                                description={`$ ${getBalanceNumber(totalHoldings).toLocaleString("en")}`}
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
                                description="25%"
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col className={'DailyProfitCol'}>
                            <InfoBlock
                                title="Daily Profits"
                                description="68 USD/day"
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col xs={12} sm={4} lg={4} className={'MonthlyProfitCol'}>
                            <InfoBlock
                                title="Monthly Profits"
                                description="2040 USD/month"
                                withColor={false}
                                isStrategy={false}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0 mt-3'}>
                        <Col className={'CurrStrategyCol'}>
                            <InfoBlock
                                title="Current strategies"
                                description="Convex finance - USDP pool"
                                withColor={false}
                                isStrategy={true}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
