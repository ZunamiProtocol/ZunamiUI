import React from 'react';
import './InfoBlock.scss';

interface InfoBlockProps {
    iconName?: string;
    title: string;
    description: string;
    withColor: boolean;
    isStrategy: boolean;
}

export const InfoBlock = (props: InfoBlockProps): JSX.Element => {
    return (
        <div className={`InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}`}>
            <div className={'InfoBlock__title'}>
                {props.iconName !== undefined ? <img src={props.iconName + '.png'} alt='' /> : ''}
                {props.title}
            </div>
            <span
                className={`InfoBlock__description ${
                    props.withColor === true ? 'InfoBlock__description_color' : ''
                }`}>
                {props.description}
            </span>
        </div>
    );
};
