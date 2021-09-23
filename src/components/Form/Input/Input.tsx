import React from 'react';
import './Input.scss';

interface InputProps {
    name: string;
    value: string;
    handler(value: string): void;
}

export const Input = (props: InputProps): JSX.Element => {
    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.handler(e.target.value);
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
            <input type='text' placeholder='0.00' onChange={changeHandler} />
        </div>
    );
};
