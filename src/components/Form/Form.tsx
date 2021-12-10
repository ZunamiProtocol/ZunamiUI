import React, {useCallback, useMemo, useState} from 'react';
import {Input} from './Input/Input';
import './Form.scss';
import {
    BIG_ZERO,
    daiAddress,
    getBalanceNumber,
    getFullDisplayBalance,
    usdcAddress,
    usdtAddress
} from "../../utils/formatbalance";
import {useAllowanceStables} from "../../hooks/useAllowance";
import {useUserBalances} from "../../hooks/useUserBalances";
import useLpPrice from "../../hooks/useLpPrice";
import useUserLpAmount from "../../hooks/useUserLpAmount";
import useApprove from "../../hooks/useApprove";
import useStake from "../../hooks/useStake";
import useUnstake from "../../hooks/useUnstake";
import {useWallet} from "use-wallet";
import {BigNumber} from "bignumber.js";

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

    const [pendingDAI, setPendingDAI] = useState(false)
    const [pendingUSDC, setPendingUSDC] = useState(false)
    const [pendingUSDT, setPendingUSDT] = useState(false)

    const lpPrice = useLpPrice()
    const userLpAmount = useUserLpAmount()
    const userBalanceList = useUserBalances()
    const approveList = useAllowanceStables()
    const stableInputsSum = parseFloat(dai) + parseFloat(usdc) + parseFloat(usdt)
    // user allowance
    const isApprovedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
    ]
    const isApproved = approveList &&
        (((parseFloat(dai) > 0 && isApprovedTokens[0]) || dai === '0' || dai === '')
            && ((parseFloat(usdc) > 0 && isApprovedTokens[1]) || usdc === '0' || usdc === '')
            && ((parseFloat(usdt) > 0 && isApprovedTokens[2]) || usdt === '0' || usdt === ''))
    // max for withdraw or deposit
    const userMaxWithdraw = lpPrice.multipliedBy(userLpAmount) || BIG_ZERO
    const userMaxWithdrawMinusInput = userMaxWithdraw.toNumber() <= 0 ? BIG_ZERO
        : new BigNumber(userMaxWithdraw.toNumber() - stableInputsSum)
    const userMaxDeposit = [
        userBalanceList && userBalanceList[0] || BIG_ZERO,
        userBalanceList && userBalanceList[1] || BIG_ZERO,
        userBalanceList && userBalanceList[2] || BIG_ZERO
    ]
    const max = [
        props.operationName.toLowerCase() === 'deposit' ? userMaxDeposit[0] : userMaxWithdrawMinusInput,
        props.operationName.toLowerCase() === 'deposit' ? userMaxDeposit[1] : userMaxWithdrawMinusInput,
        props.operationName.toLowerCase() === 'deposit' ? userMaxDeposit[2] : userMaxWithdrawMinusInput,
    ]

    // approves
    const {onApprove} = useApprove()
    const handleApproveDai = useCallback(async () => {
        try {
            setPendingDAI(true)
            const tx = onApprove(daiAddress)
            if (!tx) {
                setPendingDAI(false)
            }
        } catch (e) {
            setPendingDAI(false)
        }
    }, [onApprove])
    const handleApproveUsdc = useCallback(async () => {
        try {
            setPendingUSDC(true)
            const tx = onApprove(usdcAddress)
            if (!tx) {
                setPendingUSDC(false)
            }
        } catch (e) {
            setPendingUSDC(false)
        }
    }, [onApprove])
    const handleApproveUsdt = useCallback(async () => {
        try {
            setPendingUSDT(true)
            const tx = onApprove(usdtAddress)
            if (!tx) {
                setPendingUSDT(false)
            }
        } catch (e) {
            setPendingUSDT(false)
        }
    }, [onApprove])

    const fullBalanceLpShare = useMemo(() => {
        return getFullDisplayBalance(userLpAmount)
    }, [userLpAmount])
    // caclulate lpshare to withdraw
    const lpShareToWithdraw = new BigNumber(stableInputsSum / getBalanceNumber(lpPrice))
    const fullBalancetoWithdraw = useMemo(() => {
        return getFullDisplayBalance(lpShareToWithdraw)
    }, [lpShareToWithdraw])

    // deposit and withdraw functions
    const depositExceedAmount = parseInt(dai) > getBalanceNumber(userBalanceList[0])
        || parseInt(usdc) > getBalanceNumber(userBalanceList[1],  6)
        || parseInt(usdt) > getBalanceNumber(userBalanceList[2], 6)
    const [pendingTx, setPendingTx] = useState(false)
    const [pendingWithdraw, setPendingWithdraw] = useState(false)
    const {onStake} = useStake(dai === '' ? '0' : dai, usdc === '' ? '0' : usdc, usdt === '' ? '0' : usdt)
    const {onUnstake} = useUnstake(fullBalancetoWithdraw, dai === '' ? '0' : dai, usdc === '' ? '0' : usdc, usdt === '' ? '0' : usdt)

    // user wallet
    const {account} = useWallet()

    // TODO: need detect canceled tx's by user

    return (
        <div className={'Form'}>
            <form>
                <Input name='DAI' value={dai} handler={daiInputHandler} max={max[0]}/>
                <Input name='USDC' value={usdc} handler={usdcInputHandler} max={max[1]}/>
                <Input name='USDT' value={usdt} handler={usdtInputHandler} max={max[2]}/>
                {props.operationName.toLowerCase() === 'deposit' &&
                <div>
                    {account && parseFloat(dai) > 0 && !isApprovedTokens[0] &&
                    <button disabled={pendingDAI} onClick={handleApproveDai}>Approve DAI </button>
                    }
                    {account && parseFloat(usdc) > 0 && !isApprovedTokens[1] &&
                    <button disabled={pendingUSDC} onClick={handleApproveUsdc}>Approve USDC </button>
                    }
                    {account && parseFloat(usdt) > 0 && !isApprovedTokens[2] &&
                    <button disabled={pendingUSDT} onClick={handleApproveUsdt}>Approve USDT </button>
                    }
                    {account && <button
                        onClick={async () => {
                            setPendingTx(true)
                            await onStake()
                            setPendingTx(false)
                        }}
                        disabled={(dai === '' && usdc === '' && usdt === '') || !isApproved || pendingTx || depositExceedAmount}
                    >
                        Deposit
                    </button>}
                </div>
                }
                {props.operationName.toLowerCase() === 'withdraw' &&
                <div>
                    {account && <button
                        onClick={async () => {
                            setPendingWithdraw(true)
                            await onUnstake()
                            setPendingWithdraw(false)
                        }}
                        disabled={(dai === '' && usdc === '' && usdt === '') || pendingWithdraw
                        || fullBalanceLpShare === '0' || userMaxWithdraw.toNumber() < lpShareToWithdraw.toNumber()}
                    >
                        Withdraw
                    </button>}
                    {/*<input type='submit' value={'Withdraw all'} className={'Form__WithdrawAll'}/>*/}
                </div>
                }
            </form>
        </div>
    );
};
