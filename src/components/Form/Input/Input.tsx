import React, {useCallback, useMemo, useState} from 'react';
import './Input.scss';
import BigNumber from "bignumber.js";
import {getFullDisplayBalance} from "../../../utils/formatbalance";

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
    max: BigNumber;
}

export const Input = (props: InputProps): JSX.Element => {
    const [value, setValue] = useState('');
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (regex.test(e.target.value)) {
            props.handler(e.target.value);
            setValue(e.target.value);
        }
    };

    const fullBalance = useMemo(() => {
        return getFullDisplayBalance(props.max)
    }, [props.max])

    const handleSelectMax = useCallback(() => {
        setValue(fullBalance)
    }, [fullBalance, setValue])

    const isBalanceZero = fullBalance === '0' || !fullBalance
    const displayBalance = isBalanceZero ? '0.00' : parseFloat(fullBalance).toFixed(2)

    return (
        <div className={'Input'}>
            <div className='InputInfo'>
                <img src={`${props.name}.svg`} alt='' />
                <div className='balanceInfo'>
                    <span className={'coinName'}>{props.name}</span>
                    <div className='maxBalance' onClick={handleSelectMax}>
                        <span className='max'>MAX</span>
                        <span className='balance'>{displayBalance}</span>
                    </div>
                </div>
            </div>
            <input
                inputMode={'decimal'}
                autoComplete={'off'}
                autoCorrect={'off'}
                type={'text'}
                pattern={'^[0-9]*[.,]?[0-9]*$'}
                placeholder={'0.00'}
                min={0}
                minLength={1}
                maxLength={79}
                value={value}
                onChange={changeHandler}
            />
        </div>
    );
};
