import React from 'react';
import {Header} from '../components/Header/Header';
import {InfoBlock} from '../components/InfoBlock/InfoBlock';
import {SideBar} from '../components/SideBar/SideBar';
import './Main.scss';
import { Container, Row, Col } from 'react-bootstrap';

export const Main = (): JSX.Element => {
    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header />
            <Row className={'mt-3 h-100 mb-4 main-row'}>
                <SideBar isMainPage={true} />
                <Col className={'content-col'}>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0'}>
                        <Col>
                            <InfoBlock
                                iconName='yes'
                                title='Already earned'
                                description='$ 0'
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col>
                            <InfoBlock
                                iconName='balance'
                                title='Balance'
                                description='$ 100 000'
                                withColor={true}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col>
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
                        <Col>
                            <InfoBlock
                                title='APY'
                                description='25%'
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col>
                            <InfoBlock
                                title='Daily Profits'
                                description='68 USD/day'
                                withColor={false}
                                isStrategy={false}
                                isLong={false}
                            />
                        </Col>
                        <Col>
                            <InfoBlock
                                title='Monthly Profits'
                                description='2040 USD/month'
                                withColor={false}
                                isStrategy={false}
                                isLong={true}
                            />
                        </Col>
                    </Row>
                    <Row className={'zun-rounded zun-shadow ms-0 me-0 mt-3'}>
                        <Col>
                            <InfoBlock
                                title='Current strategies'
                                description='Convex finance - USDP pool'
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
