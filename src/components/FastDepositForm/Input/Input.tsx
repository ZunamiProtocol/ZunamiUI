import React, { useCallback, useMemo } from 'react';
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
    onCoinChange?: Function;
    chainId: number | undefined;
}

export const Input = (props: InputProps): JSX.Element => {
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    const fullBalance = useMemo(() => {
        let decimals = props.name === 'DAI' ? 18 : 6;

        if (props.action === 'withdraw') {
            decimals = 18;
        }

        if (props.chainId !== 1) {
            decimals = 18;
        }

        return getFullDisplayBalance(props.max, decimals);
    }, [props.max, props.name, props.action, props.chainId]);

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (regex.test(e.target.value)) {
            props.handler(e.target.value);
        }
    };

    const handleSelectMax = useCallback(() => {
        props.handler(fullBalance);
    }, [fullBalance, props]);

    return (
        <div className={`FastDepositInput ${props.disabled ? 'disabled' : ''}`}>
            <img src={`${props.name}.svg`} alt="" />
            <div className={'coinName'}>{props.name}</div>
            <svg
                width="14"
                height="5"
                viewBox="0 0 14 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="selector"
            >
                <path d="M1 1L7 4L13 1" stroke="#404040" strokeWidth="1.1" strokeLinecap="round" />
            </svg>

            <select
                value={props.name}
                onChange={(val) => {
                    if (props.onCoinChange) {
                        props.onCoinChange(val.target.value);
                    }
                }}
            >
                {props.chainId === 1 && <option value="DAI">DAI</option>}
                {props.chainId === 1 && <option value="USDC">USDC</option>}
                {props.chainId === 56 && <option value="BUSD">BUSD</option>}
                <option value="USDT">USDT</option>
            </select>
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
                value={props.value}
                onChange={changeHandler}
            />
            <span className="max" onClick={handleSelectMax}>
                MAX
            </span>
        </div>
    );
};
