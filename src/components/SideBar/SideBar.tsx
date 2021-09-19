import React from 'react';
import {LinkBlock} from '../LinkBlock/LinkBlock';
import './SideBar.scss';

export const SideBar = (): JSX.Element => {
    return (
        <div className={'SideBar'}>
            <LinkBlock title='Deposit' description='Click for deposit' />
            <LinkBlock title='Withdraw' description='Click for withdraw' />
        </div>
    );
};
