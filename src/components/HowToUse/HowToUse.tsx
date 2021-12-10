import React from 'react';
import {Button} from 'react-bootstrap';
import './HowToUse.scss';

interface HowToUseProps {
    onClick: any;
}

export const HowToUse = (props: HowToUseProps): JSX.Element => {
    return (
        <Button variant={'light'} className={'HowToUse'} onClick={props.onClick}>
            <span className={'d-none d-md-block d-lg-block'}>How to use</span>
            <span className={'d-block d-sm-none'}>?</span>
        </Button>
    );
};
