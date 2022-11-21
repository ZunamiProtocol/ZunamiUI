import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Input.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../../utils/formatbalance';
import { isBSC, isPLG } from '../../../utils/zunami';

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
    action: string;
    max: BigNumber;
    disabled?: boolean;
    chainId: number | null;
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

        if (isBSC(props.chainId)) {
            decimals = 18;
        }

        if (isPLG(props.chainId)) {
            decimals = 6;
        }

        return (
            Math.trunc(Number(getFullDisplayBalance(props.max, decimals)) * 100) / 100
        ).toString();
    }, [props.max, props.name, props.action, props.chainId]);

    const handleSelectMax = useCallback(() => {
        props.handler(fullBalance);
        setValue(fullBalance);
    }, [fullBalance, setValue, props]);

    const isBalanceZero = fullBalance === '0' || !fullBalance;
    const displayBalance = isBalanceZero ? '0.00' : fullBalance;

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
                maxLength={8}
                value={value}
                onChange={changeHandler}
            />
        </div>
    );
};
