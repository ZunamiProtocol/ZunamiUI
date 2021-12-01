import React, { useState } from 'react';
import './Input.scss';

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
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

    return (
        <div className={'Input'}>
            <div className='InputInfo'>
                <img src={`${props.name}.svg`} alt='' />
                <div className='balanceInfo'>
                    <span className={'coinName'}>{props.name}</span>
                    <div className='maxBalance'>
                        <span className='max'>MAX</span>
                        <span className='balance'>0.00</span>
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
