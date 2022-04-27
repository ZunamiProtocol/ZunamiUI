import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Input.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../../utils/formatbalance';

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
    action: string;
    max: BigNumber;
    disabled?: boolean;
}

export const Input = (props: InputProps): JSX.Element => {
    const [value, setValue] = useState('');
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (regex.test(e.target.value)) {
            props.handler(e.target.value);
            setValue(Number(e.target.value).toString());
        }
    };

    const fullBalance = useMemo(() => {
        let decimals = props.name === 'DAI' ? 18 : 6;

        if (props.action === 'withdraw') {
            decimals = 18;
        }

        return getFullDisplayBalance(props.max, decimals);
    }, [props.max, props.name, props.action]);

    const handleSelectMax = useCallback(() => {
        props.handler(fullBalance);
        setValue(fullBalance);
    }, [fullBalance, setValue, props]);

    const isBalanceZero = fullBalance === '0' || !fullBalance;
    const displayBalance = isBalanceZero ? '0.00' : parseFloat(fullBalance).toFixed(2);

    return (
        <div className={`Input ${props.disabled ? 'disabled' : ''}`}>
            <img src={`${props.name}.svg`} alt="" />
            <div className={'coinName'}>{props.name}</div>
            <div className="divider"></div>
            <span className="max" onClick={handleSelectMax}>
                MAX
            </span>
            {props.action !== 'withdraw' && <span className="balance">{displayBalance}</span>}
            <div className="divider"></div>
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
