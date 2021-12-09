import React from 'react';
import {Header} from '../components/Header/Header';
import {InfoBlock} from '../components/InfoBlock/InfoBlock';
import {SideBar} from '../components/SideBar/SideBar';
import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { Chart } from '../components/Chart/Chart';

export const Main = (): JSX.Element => {
    const chartData = [
        { title: 'Convex finance - OUSD pool', value: 70, color: '#F64A00' },
        { title: 'Convex finance - USDP pool', value: 30, color: '#B8E654' },
    ];

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header />
            <Row className={'mt-3 h-100 mb-4 main-row'}>
                <SideBar isMainPage={true} />
                <Col className={'content-col dashboard-col'}>
                    <ClickableHeader name={'Dashboard'} />
                    <Row className={'zun-rounded zun-shadow ms-0 me-0'}>
                        <Col className={'AlreadyEarnedCol'}>
                            <InfoBlock
                                iconName='yes'
                                title='Already earned'
                                description='$ 0'
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col className={'BalanceCol'}>
                            <InfoBlock
                                iconName='balance'
                                title='Balance'
                                description='$ 100 000'
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col xs={12} sm={4} lg={4} className={'TvlCol'}>
                            <InfoBlock
                                iconName='lock'
                                title='Total Value Locked'
                                description='$ 100 000 000'
                                withColor={true}
                                isStrategy={false}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0 mt-3'}>
                        <Col className={'ApyCol'}>
                            <InfoBlock
                                title='APY'
                                description='25%'
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col className={'DailyProfitCol'}>
                            <InfoBlock
                                title='Daily Profits'
                                description='68 USD/day'
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col xs={12} sm={4} lg={4} className={'MonthlyProfitCol'}>
                            <InfoBlock
                                title='Monthly Profits'
                                description='2040 USD/month'
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
