import React, {useState} from 'react';
import {Input} from './Input/Input';
import {deposit, withdraw} from '../../actions/FinOperation';
import './Form.scss';

interface FormProps {
    operationName: string;
}

export const Form = (props: FormProps): JSX.Element => {
    const [dai, setDai] = useState('');
    const [usdc, setUsdc] = useState('');
    const [usdt, setUsdt] = useState('');

    const daiInputHandler = (newValue: string) => {
        setDai(newValue);
    };

    const usdcInputHandler = (newValue: string) => {
        setUsdc(newValue);
    };

    const usdtInputHandler = (newValue: string) => {
        setUsdt(newValue);
    };

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();

        if (props.operationName.toLowerCase() === 'deposit') {
            deposit(dai, usdc, usdt);
        } else if (props.operationName.toLowerCase() === 'withdraw') {
            withdraw(dai, usdc, usdt);
        }
    };

    return (
        <div className={'Form'}>
            <form onSubmit={submitHandler}>
                <Input name='DAI' value={dai} handler={daiInputHandler} />
                <Input name='USDC' value={usdc} handler={usdcInputHandler} />
                <Input name='USDT' value={usdt} handler={usdtInputHandler} />
                <input type='submit' value={props.operationName} />
            </form>
        </div>
    );
};
