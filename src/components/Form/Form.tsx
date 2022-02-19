import { useCallback, useMemo, useState, useRef } from 'react';
import { Input } from './Input/Input';
import './Form.scss';
import {
    BIG_ZERO,
    daiAddress,
    getBalanceNumber,
    getFullDisplayBalance,
    usdcAddress,
    usdtAddress,
} from '../../utils/formatbalance';
import { useAllowanceStables } from '../../hooks/useAllowance';
import { useUserBalances } from '../../hooks/useUserBalances';
// import useLpPrice from "../../hooks/useLpPrice";
import useUserLpAmount from '../../hooks/useUserLpAmount';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { useWallet } from 'use-wallet';
import { BigNumber } from 'bignumber.js';
import { Modal, Button, Toast, ToastContainer } from 'react-bootstrap';
import { NoWallet } from '../NoWallet/NoWallet';
import { ActionSelector } from './ActionSelector/ActionSelector';
import { DirectAction } from './DirectAction/DirectAction';

interface FormProps {
    operationName: string;
}

interface TransactionError {
    code?: Number;
    message?: String;
}

const getDepositValidationError = (
    dai: String,
    usdc: String,
    usdt: String,
    isApproved: Boolean,
    pendingTx: Boolean,
    depositExceedAmount: Boolean
) => {
    let error = '';

    if (dai === '' && usdc === '' && usdt === '') {
        error = 'Please, enter the amount of stablecoins to deposit';
    } else if (depositExceedAmount) {
        error = "You're trying to deposit more than you have";
    } else if (!isApproved) {
        error = 'You have to approve your funds before the deposit';
    } else if (pendingTx) {
        error = "You can't deposit because have a pending transaction";
    }

    return error;
};

const getWithdrawValidationError = (
    dai: String,
    usdc: String,
    usdt: String,
    fullBalanceLpShare: String,
    userMaxWithdraw: BigNumber,
    lpShareToWithdraw: BigNumber
) => {
    let error = '';

    if (dai === '' && usdc === '' && usdt === '') {
        error = 'Please, enter the amount to withdraw';
    } else if (userMaxWithdraw.toNumber() < lpShareToWithdraw.toNumber()) {
        error = "You're trying to withdraw more than you have";
    } else if (fullBalanceLpShare === '0') {
        error = 'You have zero LP shares';
    }

    return error;
};

export const Form = (props: FormProps): JSX.Element => {
    const [action, setAction] =
        useState(props.operationName === 'Deposit' ? 'deposit' : 'withdraw');
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

    const [pendingDAI, setPendingDAI] = useState(false);
    const [pendingUSDC, setPendingUSDC] = useState(false);
    const [pendingUSDT, setPendingUSDT] = useState(false);

    // const lpPrice = useLpPrice();

    // wrapped in useMemo to prevent lpShareToWithdraw hook deps change on every render
    const lpPrice = useMemo(() => new BigNumber(1), []);
    const userLpAmount = useUserLpAmount();
    const userBalanceList = useUserBalances();
    const approveList = useAllowanceStables();
    const stableInputsSum =
        (parseFloat(dai) || 0) + (parseFloat(usdc) || 0) + (parseFloat(usdt) || 0);
    // user allowance
    const isApprovedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
    ];
    const isApproved =
        approveList &&
        ((parseFloat(dai) > 0 && isApprovedTokens[0]) || dai === '0' || dai === '') &&
        ((parseFloat(usdc) > 0 && isApprovedTokens[1]) || usdc === '0' || usdc === '') &&
        ((parseFloat(usdt) > 0 && isApprovedTokens[2]) || usdt === '0' || usdt === '');
    // max for withdraw or deposit
    const userMaxWithdraw = lpPrice.multipliedBy(userLpAmount) || BIG_ZERO;
    const userMaxWithdrawMinusInput =
        !userMaxWithdraw || userMaxWithdraw.toNumber() <= 0 || !userMaxWithdraw.toNumber()
            ? BIG_ZERO
            : new BigNumber(userMaxWithdraw.toNumber() - stableInputsSum);
    const userMaxDeposit = [
        (userBalanceList && userBalanceList[0].toNumber() > 0 && userBalanceList[0]) || BIG_ZERO,
        (userBalanceList && userBalanceList[1].toNumber() > 0 && userBalanceList[1]) || BIG_ZERO,
        (userBalanceList && userBalanceList[2].toNumber() > 0 && userBalanceList[2]) || BIG_ZERO,
    ];
    const max = [
        action === 'deposit' ? userMaxDeposit[0] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[1] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[2] : userMaxWithdrawMinusInput,
    ];

    // approves
    const { onApprove } = useApprove();
    const handleApproveDai = useCallback(async () => {
        try {
            setPendingDAI(true);
            const tx = onApprove(daiAddress);
            if (!tx) {
                setPendingDAI(false);
            }
        } catch (e) {
            setPendingDAI(false);
        }
    }, [onApprove]);
    const handleApproveUsdc = useCallback(async () => {
        try {
            setPendingUSDC(true);
            const tx = onApprove(usdcAddress);
            if (!tx) {
                setPendingUSDC(false);
            }
        } catch (e) {
            setPendingUSDC(false);
        }
    }, [onApprove]);
    const handleApproveUsdt = useCallback(async () => {
        try {
            setPendingUSDT(true);
            const tx = onApprove(usdtAddress);
            if (!tx) {
                setPendingUSDT(false);
            }
        } catch (e) {
            setPendingUSDT(false);
        }
    }, [onApprove]);

    const fullBalanceLpShare = useMemo(() => {
        return getFullDisplayBalance(userLpAmount);
    }, [userLpAmount]);

    // caclulate lpshare to withdraw
    const lpShareToWithdraw = useMemo(() => {
        return new BigNumber(stableInputsSum / getBalanceNumber(lpPrice));
    }, [stableInputsSum, lpPrice]);

    const fullBalancetoWithdraw = useMemo(() => {
        return getFullDisplayBalance(lpShareToWithdraw);
    }, [lpShareToWithdraw]);

    // deposit and withdraw functions
    const depositExceedAmount =
        parseInt(dai) > getBalanceNumber(userBalanceList[0]) ||
        parseInt(usdc) > getBalanceNumber(userBalanceList[1], 6) ||
        parseInt(usdt) > getBalanceNumber(userBalanceList[2], 6);
    const [pendingTx, setPendingTx] = useState(false);
    const [pendingWithdraw, setPendingWithdraw] = useState(false);
    const { onStake } = useStake(
        dai === '' ? '0' : dai,
        usdc === '' ? '0' : usdc,
        usdt === '' ? '0' : usdt
    );
    const { onUnstake } = useUnstake(
        fullBalancetoWithdraw,
        dai === '' ? '0' : dai,
        usdc === '' ? '0' : usdc,
        usdt === '' ? '0' : usdt
    );

    // user wallet
    const { account } = useWallet();

    // TODO: need detect canceled tx's by user
    const [transactionError, setTransactionError] = useState<TransactionError>();

    const [showModal, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const canDeposit =
        (dai === '' && usdc === '' && usdt === '') ||
        !isApproved ||
        pendingTx ||
        depositExceedAmount;

    if (!account) {
        return <NoWallet />;
    }

    const validationError =
        action === 'deposit'
            ? getDepositValidationError(dai, usdc, usdt, isApproved, pendingTx, depositExceedAmount)
            : getWithdrawValidationError(
                  dai,
                  usdc,
                  usdt,
                  fullBalanceLpShare,
                  userMaxWithdraw,
                  lpShareToWithdraw
              );

    return (
        <div className={'Form'}>
            <Modal
                show={showModal}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Warning!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Please note. This is a beta version. The contract has not been auditied yet. Use
                    it at your own risk.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            setModalShow(false);
                            setPendingTx(true);
                            await onStake();
                            setPendingTx(false);
                        }}
                    >
                        Understood
                    </Button>
                </Modal.Footer>
            </Modal>
            {transactionError && (
                <ToastContainer position={'top-end'} className={'mt-3 me-3'}>
                    <Toast onClose={() => setTransactionError(undefined)} delay={5000} autohide>
                        <Toast.Header>
                            <strong className="me-auto">Error</strong>
                            <small>now</small>
                        </Toast.Header>
                        <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                    </Toast>
                </ToastContainer>
            )}
            <form
                id={action}
                onSubmit={async (e) => {
                    e.preventDefault();

                    switch (action) {
                        case 'withdraw':
                            // @ts-ignore
                            window.dataLayer.push({ event: "withdraw" });
                            setPendingWithdraw(true);

                            try {
                                await onUnstake();
                            } catch (error: any) {
                                setPendingWithdraw(false);
                                setTransactionError(error);
                            }

                            setPendingWithdraw(false);
                            break;
                        case 'deposit':
                            // @ts-ignore
                            window.dataLayer.push({ event: "deposit" });
                            setModalShow(true);
                            break;
                    }
                }}
            >
                <ActionSelector
                    value={action}
                    onChange={(action: string) => {
                        setAction(action);
                    }}
                />
                <Input name="DAI" value={dai} handler={daiInputHandler} max={max[0]} />
                <Input name="USDC" value={usdc} handler={usdcInputHandler} max={max[1]} />
                <Input name="USDT" value={usdt} handler={usdtInputHandler} max={max[2]} />
                {action === 'deposit' && (
                    <div className="d-flex flex-row flex-wrap buttons">
                        {account && parseFloat(dai) > 0 && !isApprovedTokens[0] && (
                            <button
                                disabled={pendingDAI || depositExceedAmount}
                                onClick={handleApproveDai}
                            >
                                Approve DAI{' '}
                            </button>
                        )}
                        {account && parseFloat(usdc) > 0 && !isApprovedTokens[1] && (
                            <button
                                disabled={pendingUSDC || depositExceedAmount}
                                onClick={handleApproveUsdc}
                            >
                                Approve USDC{' '}
                            </button>
                        )}
                        {account && parseFloat(usdt) > 0 && !isApprovedTokens[2] && (
                            <button
                                disabled={pendingUSDT || depositExceedAmount}
                                onClick={handleApproveUsdt}
                            >
                                Approve USDT{' '}
                            </button>
                        )}
                        {account && (
                            <div className="deposit-button-wrapper">
                                <button type="submit">Deposit</button>
                                <DirectAction
                                    actionName="deposit"
                                    hint="When using direct deposit / withdrawal, funds will be credited instantly, but the cost of such a transaction will be many times more expensive"
                                />
                            </div>
                        )}
                        {validationError && (
                            <div className={'mt-2 text-danger error'}>{validationError}</div>
                        )}
                    </div>
                )}
                {action === 'withdraw' && (
                    <div>
                        {account && (
                            <div className="deposit-button-wrapper">
                                <button type="submit">Withdraw</button>
                                <DirectAction
                                    actionName="withdraw"
                                    hint="When using direct deposit / withdrawal, funds will be credited instantly,
                                but the cost of such a transaction will be many times more expensive"
                                />
                            </div>
                        )}
                        {pendingWithdraw && (
                            <div className={'d-flex align-items-center'}>
                                <div>Please, approve the transaction</div>
                                <div className={'preloader ms-2'}></div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};
