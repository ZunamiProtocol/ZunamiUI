import React from 'react';
import {Header} from '../components/Header/Header';
import {SideBar} from '../components/SideBar/SideBar';
import {ClickableHeader} from '../components/ClickableHeader/ClickableHeader';
import {Form} from '../components/Form/Form';
import './FinanceOperations.scss';

interface FinanceOperationsProps {
    operationName: string;
}

export const FinanceOperations = (props: FinanceOperationsProps): JSX.Element => {
    return (
        <div className={'DepositContainer'}>
            <Header />
            <div className={'DepositBlock'}>
                <SideBar />
                <div className={'DepositContent'}>
                    <ClickableHeader name={props.operationName} />
                    <Form operationName={props.operationName} />
                </div>
            </div>
        </div>
    );
};
