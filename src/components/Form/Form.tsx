import { useCallback, useMemo, useState } from 'react';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
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
import useUserLpAmount from '../../hooks/useUserLpAmount';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { useWallet } from 'use-wallet';
import { BigNumber } from 'bignumber.js';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ActionSelector } from './ActionSelector/ActionSelector';
import { DirectAction } from './DirectAction/DirectAction';
import { getActiveWalletName, getActiveWalletAddress } from '../WalletsModal/WalletsModal';

interface FormProps extends React.HTMLProps<HTMLDivElement> {
    operationName: string;
    directOperation: boolean;
    onOperationModeChange?: Function;
    sharePercent: number;
    onCoinChange?: Function;
    dai: string;
    usdc: string;
    usdt: string;
    selectedCoinIndex: number;
    directOperationDisabled?: boolean;
    lpPrice: BigNumber;
    onWithdraw?: Function;
    onDeposit?: Function;
}

interface TransactionError {
    code?: Number;
    message?: String;
}

export const getDepositValidationError = (
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
    }

    return error;
};

export const getWithdrawValidationError = (
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

export const Form: React.FC<FormProps> = ({
    operationName,
    onCoinChange,
    dai,
    usdc,
    usdt,
    lpPrice,
    directOperation,
    sharePercent,
    onOperationModeChange,
    selectedCoinIndex,
    onWithdraw,
    directOperationDisabled,
    onDeposit,
    ...props
}) => {
    const { account } = useWallet();

    const [action, setAction] = useState(operationName === 'Deposit' ? 'deposit' : 'withdraw');

    const daiInputHandler = (newValue: string) => {
        if (onCoinChange) {
            onCoinChange('dai', newValue);
        }
    };

    const usdcInputHandler = (newValue: string) => {
        if (onCoinChange) {
            onCoinChange('usdc', newValue);
        }
    };

    const usdtInputHandler = (newValue: string) => {
        if (onCoinChange) {
            onCoinChange('usdt', newValue);
        }
    };

    const [pendingDAI, setPendingDAI] = useState(false);
    const [pendingUSDC, setPendingUSDC] = useState(false);
    const [pendingUSDT, setPendingUSDT] = useState(false);

    // wrapped in useMemo to prevent lpShareToWithdraw hook deps change on every render
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

    // max for withdraw or deposit
    const userMaxWithdraw = lpPrice.multipliedBy(userLpAmount) || BIG_ZERO;

    const userMaxWithdrawMinusInput =
        !userMaxWithdraw || userMaxWithdraw.toNumber() <= 0 || !userMaxWithdraw.toNumber()
            ? BIG_ZERO
            : new BigNumber(userMaxWithdraw.toNumber() - stableInputsSum);

    // max sums for deposit
    const userMaxDeposit = [
        (userBalanceList && userBalanceList[0].toNumber() > 0 && userBalanceList[0]) || BIG_ZERO,
        (userBalanceList && userBalanceList[1].toNumber() > 0 && userBalanceList[1]) || BIG_ZERO,
        (userBalanceList && userBalanceList[2].toNumber() > 0 && userBalanceList[2]) || BIG_ZERO,
    ];

    // final array both for deposit and withdraw
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
        setPendingUSDT(true);

        try {
            const tx = onApprove(usdtAddress);
            if (!tx) {
                setPendingUSDT(false);
            }
        } catch (e) {
            setPendingUSDT(false);
        }

        setPendingUSDT(false);
    }, [onApprove]);

    const fullBalanceLpShare = useMemo(() => {
        return getFullDisplayBalance(userLpAmount);
    }, [userLpAmount]);

    // caclulate lpshare to withdraw
    const lpShareToWithdraw = useMemo(() => {
        if (operationName !== 'Withdraw') {
            return BIG_ZERO;
        }

        const sharesAmount = new BigNumber(stableInputsSum / getBalanceNumber(lpPrice).toNumber());

        if (sharesAmount.toNumber() > 0) {
            console.log(`lpShareToWithdraw: ${sharesAmount} (${stableInputsSum} / ${lpPrice})`);
        }

        return sharesAmount;
    }, [stableInputsSum, lpPrice, operationName]);

    const fullBalancetoWithdraw = useMemo(() => {
        return getFullDisplayBalance(lpShareToWithdraw, 18);
    }, [lpShareToWithdraw]);

    // deposit and withdraw functions
    const depositExceedAmount =
        parseInt(dai) > getBalanceNumber(userBalanceList[0]).toNumber() ||
        parseInt(usdc) > getBalanceNumber(userBalanceList[1], 6).toNumber() ||
        parseInt(usdt) > getBalanceNumber(userBalanceList[2], 6).toNumber();

    const [pendingTx, setPendingTx] = useState(false);
    const [transactionId, setTransactionId] = useState(undefined);

    const { onStake } = useStake(
        dai === '' ? '0' : dai,
        usdc === '' ? '0' : usdc,
        usdt === '' ? '0' : usdt,
        directOperation
    );

    const { onUnstake } = useUnstake(
        directOperation ? Number(fullBalancetoWithdraw) * 0.1 : Number(fullBalancetoWithdraw),
        dai === '' ? '0' : dai,
        usdc === '' ? '0' : usdc,
        usdt === '' ? '0' : usdt,
        !directOperation,
        sharePercent,
        directOperation && selectedCoinIndex === -1 ? 0 : selectedCoinIndex
    );

    // TODO: need detect canceled tx's by user
    const [transactionError, setTransactionError] = useState<TransactionError>();
    const emptyFunds = !Number(dai) && !Number(usdc) && !Number(usdt);

    const isApproved =
        approveList &&
        ((parseFloat(dai) > 0 && isApprovedTokens[0]) || dai === '0' || dai === '') &&
        ((parseFloat(usdc) > 0 && isApprovedTokens[1]) || usdc === '0' || usdc === '') &&
        ((parseFloat(usdt) > 0 && isApprovedTokens[2]) || usdt === '0' || usdt === '');

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

    const cantDeposit = emptyFunds || !isApproved || pendingTx || depositExceedAmount;
    const classNames = ['Form', props.className].join(' ');

    return (
        <div className={classNames} {...props}>
            <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
                {transactionError && (
                    <Toast onClose={() => setTransactionError(undefined)} delay={5000} autohide>
                        <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                    </Toast>
                )}
                {transactionId && (
                    <Toast onClose={() => setTransactionId(undefined)} delay={15000} autohide>
                        <Toast.Body>
                            Success! Check out the{' '}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={`https://etherscan.io/tx/${transactionId}`}
                            >
                                transaction
                            </a>
                        </Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
            <form
                id={action}
                onSubmit={async (e) => {
                    e.preventDefault();

                    const totalSum = parseInt(dai, 10) + parseInt(usdc, 10) + parseInt(usdt, 10);

                    switch (action) {
                        case 'withdraw':
                            setPendingTx(true);

                            try {
                                const tx = await onUnstake();
                                setTransactionId(tx.transactionHash);

                                // @ts-ignore
                                window.dataLayer.push({
                                    event: 'withdrawal',
                                    userID: getActiveWalletAddress(),
                                    type: getActiveWalletName(),
                                    value: totalSum,
                                });
                            } catch (error: any) {
                                setTransactionError(error);
                            }

                            if (onWithdraw) {
                                onWithdraw();
                            }

                            setPendingTx(false);
                            break;
                        case 'deposit':
                            setPendingTx(true);

                            try {
                                const tx = await onStake();
                                setTransactionId(tx.transactionHash);

                                // @ts-ignore
                                window.dataLayer.push({
                                    event: 'deposit',
                                    userID: getActiveWalletAddress(),
                                    type: getActiveWalletName(),
                                    value: totalSum,
                                });
                            } catch (error: any) {
                                setTransactionError(error);
                            }

                            if (onDeposit) {
                                onDeposit();
                            }

                            setPendingTx(false);
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
                <div className="inner">
                    <Input
                        action={action}
                        name="DAI"
                        value={dai}
                        handler={daiInputHandler}
                        max={max[0]}
                        disabled={action === 'withdraw'}
                    />
                    <Input
                        action={action}
                        name="USDC"
                        value={usdc}
                        handler={usdcInputHandler}
                        max={max[1]}
                        disabled={action === 'withdraw'}
                    />
                    <Input
                        action={action}
                        name="USDT"
                        value={usdt}
                        handler={usdtInputHandler}
                        max={max[2]}
                        disabled={action === 'withdraw'}
                    />
                    {action === 'deposit' && (
                        <div className="deposit-action flex-wrap d-flex flex-row flex-wrap buttons align-items-center">
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
                                    <button type="submit" disabled={cantDeposit}>
                                        Deposit
                                    </button>
                                    {!pendingTx && (
                                        <DirectAction
                                            actionName="deposit"
                                            checked={!directOperation}
                                            disabled={false}
                                            hint="When using optimized deposit funds will be deposited within 24 hours and many times cheaper"
                                            onChange={(state: boolean) => {
                                                if (onOperationModeChange) {
                                                    onOperationModeChange(state);
                                                }
                                            }}
                                        />
                                    )}
                                    {pendingTx && <Preloader className="ms-2" />}
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
                                    <button
                                        type="submit"
                                        className={`${
                                            Number(fullBalancetoWithdraw) <= 0 ? 'disabled' : ''
                                        }`}
                                    >
                                        Withdraw
                                    </button>
                                    {!pendingTx && (
                                        <DirectAction
                                            actionName="withdraw"
                                            disabled={directOperationDisabled || false}
                                            checked={!directOperation}
                                            hint="When using optimized withdrawal funds will be withdrawn within 24 hours and many times cheaper. Optimized withdraw available only in all coins."
                                            onChange={(state: boolean) => {
                                                if (onOperationModeChange) {
                                                    onOperationModeChange(state);
                                                }
                                            }}
                                        />
                                    )}
                                    {pendingTx && <Preloader className="ms-2" />}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
