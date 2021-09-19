import React from 'react';
import './Input.scss';

interface InputProps {
    name: string;
}

export const Input = (props: InputProps): JSX.Element => {
    return (
        <div className={'Input'}>
            <div className='InputInfo'>
                <img src={`${props.name}.png`} alt='' />
                <div className='balanceInfo'>
                    <span className={'coinName'}>{props.name}</span>
                    <div className='maxBalance'>
                        <span className='max'>MAX</span>
                        <span className='balance'>0.00</span>
                    </div>
                </div>
            </div>
            <input type='text' placeholder='0.00' />
        </div>
    );
};
