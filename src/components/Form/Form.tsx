import React from 'react';
import {Input} from './Input/Input';
import './Form.scss';

interface FormProps {
    operationName: string;
}

export const Form = (props: FormProps): JSX.Element => {
    return (
        <div className={'Form'}>
            <form action=''>
                <Input name='DAI' />
                <Input name='USDC' />
                <Input name='USDT' />
                <input type='submit' value={props.operationName} />
            </form>
        </div>
    );
};
