import { useState } from 'react';
import './LockedCoinInput.scss';

interface InputProps {
    onMaxClick?: Function;
    onChange?: Function;
    value: number;
    max?: number;
    token: string;
    icon: string;
}

export const LockedCoinInput = (props: InputProps): JSX.Element => {
    const [value, setValue] = useState(0);

    return (
        <div className="Staking__Locked__Token">
            <img src={props.icon} alt="" className="icon" />
            <span className="token">{props.token}</span>
            <div className="divider"></div>
            <div
                className="max"
                onClick={() => {
                    if (props.onMaxClick) {
                        props.onMaxClick();
                    }
                }}
            >
                max
            </div>
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
                onChange={(e: any) => {
                    const val = e.target.value;
                    setValue(val);

                    if (props.onChange) {
                        props.onChange(val);
                    }
                }}
            />
        </div>
    );
};
