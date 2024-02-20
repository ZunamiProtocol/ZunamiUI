import React, { useCallback, useMemo } from 'react';
import './Input.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../../utils/formatbalance';
import { CoinSelector } from '../../CoinSelector/CoinSelector';
import { sepolia } from 'wagmi';

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
    action: string;
    max: BigNumber;
    disabled?: boolean;
    onCoinChange?: Function;
    chainId: number | undefined;
    mode: string;
    className: string;
    hideToggler?: boolean;
    stakingMode: string;
}

export const Input = (props: InputProps): JSX.Element => {
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    const fullBalance = useMemo(() => {
        let decimals = props.name === 'DAI' ? 18 : 6;
        let decimalPlaces = 18;

        if (props.action === 'withdraw') {
            decimals = 18;
        }

        if (props.chainId !== 1) {
            decimals = 18;
        }

        if (props.name === 'zunUSD') {
            decimals = 18;
        }

        if (props.max && !props.max.toNumber()) {
            decimalPlaces = 0;
        }

        if (props.chainId === sepolia.id) {
            if (props.action === 'deposit') {
                decimals = 6;
            }

            if (props.name === 'zunUSD') {
                decimals = 18;
            }

            if (props.name === 'DAI') {
                decimals = 18;
            }

            if (props.action === 'withdraw' && props.name === 'apsZunUSDLP') {
                decimals = 18;
            }
        }

        return getFullDisplayBalance(props.max, decimals, decimalPlaces);
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
        <div
            className={`FastDepositInput ${props.disabled ? 'disabled' : ''} ${
                props.className ? props.className : ''
            }`}
        >
            <div className="selector-wrapper">
                <CoinSelector
                    name={props.name}
                    chainId={props.chainId}
                    mode={props.mode}
                    stakingMode={props.stakingMode}
                    hideToggler={props.hideToggler}
                    onCoinSelect={(coinName: string) => {
                        if (props.onCoinChange) {
                            props.onCoinChange(coinName);
                        }
                    }}
                />
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
                value={props.value}
                onChange={changeHandler}
            />
            <span className="max" onClick={handleSelectMax}>
                MAX
            </span>
        </div>
    );
};
