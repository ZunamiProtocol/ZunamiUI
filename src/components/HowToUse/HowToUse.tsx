import React from 'react';
import { Button } from 'react-bootstrap';
import './HowToUse.scss';

export const HowToUse = (): JSX.Element => {
    return (
        <Button variant={'light'} className={'HowToUse'}>
            <span className={'d-none d-md-block d-lg-block'}>How to use</span>
            <span className={'d-block d-sm-none'}>?</span>
        </Button>
    );
};
