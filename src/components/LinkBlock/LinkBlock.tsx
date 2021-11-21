import React from 'react';
import {useHistory} from 'react-router-dom';
import './LinkBlock.scss';

interface LinkBlockProps {
    title: string;
    description: string;
    url: string;
    icon: string;
    vstyle?: string;
}

export const LinkBlock = (prop: LinkBlockProps): JSX.Element => {
    const history = useHistory();

    const clickHandler = () => {
        history.push(`/${prop.url}`);
    };

    return (
        <div
            className={`LinkBlock ${prop.vstyle ? `LinkBlock__${prop.vstyle}` : ''}`}
            onClick={clickHandler}
        >
            <span className={'LinkBlock__title'}>{prop.title}</span>
            <span className={'LinkBlock__description'}>{prop.description}</span>
            <img src={prop.icon} className={'LinkBlock__icon'} alt={''} />
        </div>
    );
};
