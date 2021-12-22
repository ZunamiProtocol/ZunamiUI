import React from 'react';
import './InfoBlock.scss';

interface InfoBlockProps {
    iconName?: string;
    title: string;
    description: string;
    withColor: boolean;
    isStrategy: boolean;
    isLong: boolean;
    isLoading?: boolean;
}

export const InfoBlock = (props: InfoBlockProps): JSX.Element => {
    return (
        <div
            className={`InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}
            ${props.isLong === true ? 'InfoBlock_mobileLong' : ''}
        `}>
            <div className={'InfoBlock__title'}>
                {props.iconName !== undefined ? <img src={props.iconName + '.svg'} alt=""/> : ''}
                <span>{props.title}</span>
            </div>
            {
                props.isLoading &&
                    <div className={'preloader mt-3'}></div>
            }
            {
                !props.isLoading &&
                <span
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}>
                    <div>{props.description}</div>
                </span>
            }
        </div>
    );
};
