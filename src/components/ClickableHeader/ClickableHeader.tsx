import React from 'react';
import {useHistory} from 'react-router';
import './ClickableHeader.scss';

interface ClickableHeaderProps {
    name: string;
}

export const ClickableHeader = (props: ClickableHeaderProps): JSX.Element => {
    const history = useHistory();

    const clickHandler = () => {
        history.push('/');
    };

    return (
        <div className={'ClickableHeader'}>
            <span>{props.name}</span>
            <img onClick={clickHandler} src='exit.png' alt='' />
        </div>
    );
};
