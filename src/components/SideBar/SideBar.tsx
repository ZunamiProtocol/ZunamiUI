import React from 'react';
import {LinkBlock} from '../LinkBlock/LinkBlock';
import './SideBar.scss';

interface SideBarProps {
    isMainPage: boolean;
}

export const SideBar = (props: SideBarProps): JSX.Element => {
    return (
        <div className={`SideBar ${props.isMainPage === false ? 'SideBar_hide' : ''}`}>
            <LinkBlock title='Deposit' description='Click for deposit' />
            <LinkBlock title='Withdraw' description='Click for withdraw' />
        </div>
    );
};
