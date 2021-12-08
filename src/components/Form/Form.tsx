import React, {useState} from 'react';
import {Input} from './Input/Input';
import {
    approve,
    deposit,
    useUserAllowances,
    useUserBalances,
    withdraw
} from '../../actions/FinOperation';
import './Form.scss';
import {BIG_ZERO} from "../../utils/formatbalance";

interface FormProps {
    operationName: string;
}

export const Form = (props: FormProps): JSX.Element => {
    const [dai, setDai] = useState('');
    const [usdc, setUsdc] = useState('');
    const [usdt, setUsdt] = useState('');

    const daiInputHandler = (newValue: string) => {
        setDai(newValue);
    };

    const usdcInputHandler = (newValue: string) => {
        setUsdc(newValue);
    };

    const usdtInputHandler = (newValue: string) => {
        setUsdt(newValue);
    };

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();

        if (props.operationName.toLowerCase() === 'deposit') {
            deposit(dai, usdc, usdt);
        } else if (props.operationName.toLowerCase() === 'withdraw') {
            withdraw(dai, usdc, usdt);
        }
    };
    const [pendingDAI, setPendingDAI] = useState(false)
    const [pendingUSDC, setPendingUSDC] = useState(false)
    const [pendingUSDT, setPendingUSDT] = useState(false)

    const userBalanceList = useUserBalances()
    const approveList = useUserAllowances()
    const isApprovedTokens = [
        approveList ? approveList[0] > 0 : false,
        approveList ? approveList[1] > 0 : false,
        approveList ? approveList[2] > 0 : false,
    ]
    const isApproved = approveList &&
        (((parseFloat(dai) > 0 && isApprovedTokens[0]) || dai === '0' || dai === '')
            && ((parseFloat(usdc) > 0 && isApprovedTokens[1]) || usdc === '0' || usdc === '')
            && ((parseFloat(usdt) > 0 && isApprovedTokens[2]) || usdt === '0' || usdt === ''))
    // TODO: need calculate max amount for withdraw

    return (
        <div className={'Form'}>
            <form onSubmit={submitHandler}>
                <Input name='DAI' value={dai} handler={daiInputHandler} max={userBalanceList && userBalanceList[0] || BIG_ZERO}/>
                <Input name='USDC' value={usdc} handler={usdcInputHandler} max={userBalanceList && userBalanceList[1]|| BIG_ZERO}/>
                <Input name='USDT' value={usdt} handler={usdtInputHandler} max={userBalanceList && userBalanceList[2]|| BIG_ZERO}/>
                {props.operationName.toLowerCase() === 'deposit' &&
                <div>
                    {parseFloat(dai) > 0 &&
                    <button
                        disabled={pendingDAI}
                        onClick={async () => {
                            setPendingDAI(true)
                            await approve("DAI")
                            setPendingDAI(false)
                        }}>Approve DAI
                    </button>
                    }
                    {parseFloat(usdc) > 0 &&
                    <button disabled={pendingUSDC}
                            onClick={async () => {
                                setPendingUSDC(true)
                                await approve("USDC")
                                setPendingUSDC(false)
                            }}>Approve USDC
                    </button>
                    }
                    {parseFloat(usdt) > 0 &&
                    <button disabled={pendingUSDT}
                            onClick={async () => {
                                setPendingUSDT(true)
                                await approve("USDT")
                                setPendingUSDT(false)
                            }}>Approve USDT
                    </button>
                    }
                    {<input type='submit'
                            value={'Deposit'}
                            disabled={(dai === '' && usdc == '' && usdt === '') || !isApproved}/>}
                </div>
                }
                {
                    props.operationName.toLowerCase() === 'withdraw' &&
                    <div>
                        <input type='submit' value={'Withdraw'}/>
                        <input type='submit' value={'Withdraw all'} className={'Form__WithdrawAll'}/>
                    </div>
                }
            </form>
        </div>
    );
};
