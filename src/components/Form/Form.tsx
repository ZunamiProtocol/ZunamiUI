import { useCallback, useMemo, useState, useEffect } from 'react';
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
import useBalanceOf from '../../hooks/useBalanceOf';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { BigNumber } from 'bignumber.js';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ActionSelector } from './ActionSelector/ActionSelector';
import { DirectAction } from './DirectAction/DirectAction';
import { getActiveWalletName, getActiveWalletAddress } from '../WalletsModal/WalletsModal';
import { useGzlpAllowance } from '../../hooks/useGzlpAllowance';
import { FormProps, TransactionError } from './Form.types';
import { useWallet } from 'use-wallet';

const getDepositValidationError = (
    dai: String,
    usdc: String,
    usdt: String,
    isApproved: Boolean,
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
    const { account, chainId } = useWallet();

    const [action, setAction] = useState(
        props.operationName === 'Deposit' ? 'deposit' : 'withdraw'
    );

    const daiInputHandler = (newValue: string) => {
        if (props.onCoinChange) {
            props.onCoinChange('dai', newValue);
        }
    };

    const usdcInputHandler = (newValue: string) => {
        if (props.onCoinChange) {
            props.onCoinChange('usdc', newValue);
        }
    };

    const usdtInputHandler = (newValue: string) => {
        if (props.onCoinChange) {
            props.onCoinChange('usdt', newValue);
        }
    };

    const [pendingDAI, setPendingDAI] = useState(false);
    const [pendingUSDC, setPendingUSDC] = useState(false);
    const [pendingUSDT, setPendingUSDT] = useState(false);
    const [pendingGZLP, setPendingGZLP] = useState(false);

    // wrapped in useMemo to prevent lpShareToWithdraw hook deps change on every render
    const userLpAmount = useBalanceOf();
    const userBalanceList = useUserBalances();
    const approveList = useAllowanceStables();
    const gzlpAllowance = useGzlpAllowance();

    const stableInputsSum =
        (parseFloat(props.dai) || 0) +
        (parseFloat(props.usdc) || 0) +
        (parseFloat(props.usdt) || 0);
    // user allowance
    const isApprovedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
    ];

    // max for withdraw or deposit
    const userMaxWithdraw = props.lpPrice.multipliedBy(userLpAmount) || BIG_ZERO;

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
    const { onApprove, onGZLPApprove } = useApprove();
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
    const handleApproveGzlp = useCallback(async () => {
        try {
            setPendingGZLP(true);
            const tx = onGZLPApprove();
            if (!tx) {
                setPendingGZLP(false);
            }
        } catch (e) {
            setPendingGZLP(false);
        }
    }, [onGZLPApprove]);

    const fullBalanceLpShare = useMemo(() => {
        return getFullDisplayBalance(userLpAmount);
    }, [userLpAmount]);

    // caclulate lpshare to withdraw
    const lpShareToWithdraw = useMemo(() => {
        if (props.operationName !== 'withdraw') {
            return BIG_ZERO;
        }

        const sharesAmount = new BigNumber(
            stableInputsSum / getBalanceNumber(props.lpPrice).toNumber()
        );

        if (
            sharesAmount.toNumber() === 0 ||
            sharesAmount.toNumber() === Infinity ||
            props.lpPrice.toNumber() === 0
        ) {
            return BIG_ZERO;
        }

        console.log(
            `lpShareToWithdraw: ${sharesAmount} (${stableInputsSum} (user input) / ${props.lpPrice} (lpPrice))`
        );

        return sharesAmount;
    }, [stableInputsSum, props.lpPrice, props.operationName]);

    const fullBalancetoWithdraw = useMemo(() => {
        const balance = getFullDisplayBalance(lpShareToWithdraw, 18);
        console.log(`Full balance to withdraw: ${balance}`);
        return balance;
    }, [lpShareToWithdraw, chainId]);

    // deposit and withdraw functions
    const depositExceedAmount =
        parseInt(props.dai) > getBalanceNumber(userBalanceList[0]).toNumber() ||
        parseInt(props.usdc) > getBalanceNumber(userBalanceList[1], 6).toNumber() ||
        parseInt(props.usdt) > getBalanceNumber(userBalanceList[2], 6).toNumber();

    // const withdrawExceedBalance = Number(fullBalancetoWithdraw)

    const [pendingTx, setPendingTx] = useState(false);
    const [transactionId, setTransactionId] = useState(undefined);

    const { onStake } = useStake(
        props.dai === '' ? '0' : props.dai,
        props.usdc === '' ? '0' : props.usdc,
        props.usdt === '' ? '0' : props.usdt,
        props.directOperation
    );

    const { onUnstake } = useUnstake(
        props.directOperation ? Number(fullBalancetoWithdraw) * 0.1 : Number(fullBalancetoWithdraw),
        props.dai === '' ? '0' : props.dai,
        props.usdc === '' ? '0' : props.usdc,
        props.usdt === '' ? '0' : props.usdt,
        !props.directOperation,
        props.sharePercent,
        props.directOperation && props.selectedCoinIndex === -1 ? 0 : props.selectedCoinIndex
    );

    // TODO: need detect canceled tx's by user
    const [transactionError, setTransactionError] = useState<TransactionError>();
    const emptyFunds = !Number(props.dai) && !Number(props.usdc) && !Number(props.usdt);

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (chainId === 1) {
            setIsApproved(
                approveList &&
                    ((parseFloat(props.dai) > 0 && isApprovedTokens[0]) ||
                        props.dai === '0' ||
                        props.dai === '') &&
                    ((parseFloat(props.usdc) > 0 && isApprovedTokens[1]) ||
                        props.usdc === '0' ||
                        props.usdc === '') &&
                    ((parseFloat(props.usdt) > 0 && isApprovedTokens[2]) ||
                        props.usdt === '0' ||
                        props.usdt === '')
            );
        } else {
            setIsApproved(
                props.operationName === 'withdraw'
                    ? gzlpAllowance.toNumber() > parseFloat(props.usdt)
                    : isApprovedTokens[2]
            );
        }
    }, [
        gzlpAllowance,
        props.operationName,
        chainId,
        approveList,
        props.usdc,
        props.dai,
        props.usdt,
        isApprovedTokens,
    ]);

    const validationError =
        action === 'deposit'
            ? getDepositValidationError(
                  props.dai,
                  props.usdc,
                  props.usdt,
                  isApproved,
                  depositExceedAmount
              )
            : getWithdrawValidationError(
                  props.dai,
                  props.usdc,
                  props.usdt,
                  fullBalanceLpShare,
                  userMaxWithdraw,
                  lpShareToWithdraw
              );

    const cantDeposit = emptyFunds || !isApproved || pendingTx || depositExceedAmount;
    // console.log(
    //     `Can deposit: emptyFunds: ${emptyFunds}, isApproved: ${isApproved}, pendingTx: ${pendingTx}, depositExceedAmount: ${depositExceedAmount}`
    // );
    const canWithdraw = isApproved && Number(fullBalancetoWithdraw) > 0;

    // console.log(canWithdraw, isApproved, Number(fullBalancetoWithdraw));

    return (
        <div className={'Form'}>
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
                                href={`https://${
                                    chainId === 1 ? 'etherscan.io' : 'bscscan.com'
                                }/tx/${transactionId}`}
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

                    const totalSum =
                        parseInt(props.dai, 10) +
                        parseInt(props.usdc, 10) +
                        parseInt(props.usdt, 10);

                    switch (action) {
                        case 'withdraw':
                            setPendingTx(true);

                            try {
                                const tx = await onUnstake();

                                setTransactionId(tx.transactionHash);

                                // @ts-ignore
                                if (window.dataLayer) {
                                    window.dataLayer.push({
                                        event: 'withdrawal',
                                        userID: getActiveWalletAddress(),
                                        type: getActiveWalletName(),
                                        value: totalSum,
                                    });
                                }
                            } catch (error: any) {
                                debugger;
                                setTransactionError(error);
                            }

                            if (props.onWithdraw) {
                                props.onWithdraw();
                            }

                            setPendingTx(false);
                            break;
                        case 'deposit':
                            setPendingTx(true);

                            try {
                                const tx = await onStake();
                                setTransactionId(tx.transactionHash);
                                // @ts-ignore
                                if (window.dataLayer) {
                                    window.dataLayer.push({
                                        event: 'deposit',
                                        userID: getActiveWalletAddress(),
                                        type: getActiveWalletName(),
                                        value: totalSum,
                                    });
                                }
                            } catch (error: any) {
                                setTransactionError(error);
                            }

                            if (props.onDeposit) {
                                props.onDeposit();
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
                    {chainId === 1 && (
                        <Input
                            action={action}
                            name="DAI"
                            value={props.dai}
                            handler={daiInputHandler}
                            max={max[0]}
                            disabled={action === 'withdraw'}
                            chainId={chainId}
                        />
                    )}
                    {chainId === 1 && (
                        <Input
                            action={action}
                            name="USDC"
                            value={props.usdc}
                            handler={usdcInputHandler}
                            max={max[1]}
                            disabled={action === 'withdraw'}
                            chainId={chainId}
                        />
                    )}
                    <Input
                        action={action}
                        name="USDT"
                        value={props.usdt}
                        handler={usdtInputHandler}
                        max={max[2]}
                        disabled={action === 'withdraw'}
                        chainId={chainId}
                    />
                    {action === 'deposit' && (
                        <div className="deposit-action flex-wrap d-flex flex-row flex-wrap buttons align-items-center">
                            {account &&
                                parseFloat(props.dai) > 0 &&
                                !isApprovedTokens[0] &&
                                chainId === 1 && (
                                    <button
                                        disabled={pendingDAI || depositExceedAmount}
                                        onClick={handleApproveDai}
                                    >
                                        Approve DAI{' '}
                                    </button>
                                )}
                            {account &&
                                parseFloat(props.usdc) > 0 &&
                                !isApprovedTokens[1] &&
                                chainId === 1 && (
                                    <button
                                        disabled={pendingUSDC || depositExceedAmount}
                                        onClick={handleApproveUsdc}
                                    >
                                        Approve USDC{' '}
                                    </button>
                                )}
                            {account && parseFloat(props.usdt) > 0 && !isApprovedTokens[2] && (
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
                                            checked={!props.directOperation}
                                            disabled={chainId !== 1}
                                            hint={`${
                                                chainId === 1
                                                    ? 'When using optimized deposit funds will be deposited within 24 hours and many times cheaper'
                                                    : 'When using deposit funds will be deposited within 24 hours, because users’ funds accumulate in one batch and distribute to the ETH network in Zunami App.'
                                            }`}
                                            onChange={(state: boolean) => {
                                                if (props.onOperationModeChange) {
                                                    props.onOperationModeChange(state);
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
                                    {account && !isApproved && chainId !== 1 && (
                                        <button
                                            disabled={pendingGZLP}
                                            onClick={handleApproveGzlp}
                                            className="me-2"
                                        >
                                            Approve GZLP
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className={`${!canWithdraw ? 'disabled' : ''}`}
                                    >
                                        Withdraw
                                    </button>
                                    {!pendingTx && (
                                        <DirectAction
                                            actionName="withdraw"
                                            disabled={
                                                props.directOperationDisabled || chainId !== 1
                                            }
                                            checked={!props.directOperation}
                                            hint="When using optimized withdrawal funds will be withdrawn within 24 hours and many times cheaper. Optimized withdraw available only in all coins."
                                            onChange={(state: boolean) => {
                                                if (props.onOperationModeChange) {
                                                    props.onOperationModeChange(state);
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
