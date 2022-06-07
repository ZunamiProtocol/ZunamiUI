import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Input.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../../utils/formatbalance';

interface InputProps extends React.HTMLProps<HTMLDivElement> {
    name: string;
    value: string;
    handler(value: string): void;
    action: string;
    max: BigNumber;
    disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
    name,
    value,
    handler,
    action,
    max,
    disabled,
    className,
    ...props
}) => {
    const [innerValue, setInnerValue] = useState('');
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    useEffect(() => {
        setInnerValue(value);
    }, [value]);

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (regex.test(e.target.value)) {
            handler(e.target.value);
            setInnerValue(Number(e.target.value).toString());
        }
    };

    const fullBalance = useMemo(() => {
        let decimals = name === 'DAI' ? 18 : 6;

        if (action === 'withdraw') {
            decimals = 18;
        }

        return (Math.trunc(Number(getFullDisplayBalance(max, decimals)) * 100) / 100).toString();
    }, [max, name, action]);

    const handleSelectMax = useCallback(() => {
        handler(fullBalance);
        setInnerValue(fullBalance);
    }, [fullBalance, setInnerValue, props]);

    const isBalanceZero = fullBalance === '0' || !fullBalance;
    const displayBalance = isBalanceZero ? '0.00' : fullBalance;
    const classNames = ['Input', disabled ? 'disabled' : '', className].join(' ');

    return (
        <div className={classNames} {...props}>
            <img src={`${name}.svg`} alt="" />
            <div className={'coinName'}>{name}</div>
            <div className="divider"></div>
            <span className="max" onClick={handleSelectMax}>
                MAX
            </span>
            {action !== 'withdraw' && <span className="balance">{displayBalance}</span>}
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
                value={innerValue}
                onChange={changeHandler}
            />
        </div>
    );
};
