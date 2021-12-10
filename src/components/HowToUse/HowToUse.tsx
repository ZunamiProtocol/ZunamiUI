import React from 'react';
import { Button } from 'react-bootstrap';
import './HowToUse.scss';

interface HowToUseProps {
    onClick: any
}

export const HowToUse = (props: HowToUseProps): JSX.Element => {
    return (
        <Button variant={'light'} className={'HowToUse'} onClick={props.onClick}>
            <span className={'HowToUse__lg'}>How to use</span>
            <span className={'HowToUse__sm'}>?</span>
        </Button>
    );
};
