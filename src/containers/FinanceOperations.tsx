import React from 'react';
import {Header} from '../components/Header/Header';
import {SideBar} from '../components/SideBar/SideBar';
import {ClickableHeader} from '../components/ClickableHeader/ClickableHeader';
import {Form} from '../components/Form/Form';
import './FinanceOperations.scss';
import {Container, Row, Col} from 'react-bootstrap';

interface FinanceOperationsProps {
    operationName: string;
}

export const FinanceOperations = (props: FinanceOperationsProps): JSX.Element => {
    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header/>
            <Row className={'mt-3 h-100 mb-4 main-row'}>
                <SideBar isMainPage={true}/>
                <Col className={'content-col'}>
                    <Row className={'zun-rounded zun-shadow h-100'}>
                        <Col className={'ps-0 pe-0'}>
                            <div className={'DepositBlock'}>
                                <div className={'DepositContent'}>
                                    <ClickableHeader name={props.operationName}/>
                                    <Form operationName={props.operationName}/>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
