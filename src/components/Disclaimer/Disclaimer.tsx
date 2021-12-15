import React from 'react';
import './Disclaimer.scss';

interface DisclaimerProps {
    text: string;
}

export const Disclaimer = (props: DisclaimerProps): JSX.Element => {
    return (
        <div className={'Disclaimer'}>
            <img src="/disclaimer.svg" alt="" className={'Disclaimer__icon'}/>
            <span className={''}>{props.text}</span>
        </div>
    );
};
