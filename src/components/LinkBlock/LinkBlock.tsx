import React from 'react';
import {useHistory} from 'react-router-dom';
import './LinkBlock.scss';

interface LinkBlockProps {
    title: string;
    description: string;
}

export const LinkBlock = (prop: LinkBlockProps): JSX.Element => {
    const history = useHistory();

    const clickHandler = () => {
        history.push(`/${prop.title.toLowerCase()}`);
    };

    return (
        <div className={'LinkBlock'} onClick={clickHandler}>
            <span className={'LinkBlock__title'}>{prop.title}</span>
            <span className={'LinkBlock__description'}>{prop.description}</span>
        </div>
    );
};
