import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
    fraxAddress,
} from '../../utils/formatbalance';
import { useAllowanceStables } from '../../hooks/useAllowance';
import { useUserBalances } from '../../hooks/useUserBalances';
import useBalanceOf from '../../hooks/useBalanceOf';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { BigNumber } from 'bignumber.js';
import { OverlayTrigger, Toast, ToastContainer, Tooltip } from 'react-bootstrap';
import { ActionSelector } from './ActionSelector/ActionSelector';
import { DirectAction } from './DirectAction/DirectAction';
import { getActiveWalletName, getActiveWalletAddress } from '../WalletsModal/WalletsModal';
import { useGzlpAllowance } from '../../hooks/useGzlpAllowance';
import { FormProps, TransactionError } from './Form.types';
import { useWallet } from 'use-wallet';
import { log } from '../../utils/logger';
import { isBSC, isETH, isPLG } from '../../utils/zunami';
import { APPROVE_SUM } from '../../sushi/utils';

function getScanAddressByChainId(chainId: number) {
    let address = 'etherscan.io';

    switch (chainId) {
        case 56:
            address = 'bscscan.com';
            break;
        case 137:
            address = 'polygonscan.com';
            break;
    }

    return address;
}

const getDepositValidationError = (
    dai: String,
    usdc: String,
    usdt: String,
    frax: String,
    isApproved: Boolean,
    depositExceedAmount: Boolean
) => {
    let error = '';

    if (dai === '' && usdc === '' && usdt === '' && frax === '') {
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
    } else if (fullBalanceLpShare === '0' || lpShareToWithdraw.toNumber() === 0) {
        error = 'You have zero LP shares';
    }

    return error;
};

const getBscWithdrawValidationError = (isApproved: Boolean, lpShareToWithdraw: BigNumber) => {
    let error = '';

    if (!isApproved) {
        error = 'Please, approve GZLP before withdraw';
    }

    if (lpShareToWithdraw.toNumber() === 0) {
        error = 'You have no funds';
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

    const busdInputHandler = (newValue: string) => {
        if (props.onCoinChange) {
            props.onCoinChange('busd', newValue);
        }
    };

    const fraxInputHandler = (newValue: string) => {
        if (props.onCoinChange) {
            props.onCoinChange('frax', newValue);
        }
    };

    const [pendingDAI, setPendingDAI] = useState(false);
    const [pendingUSDC, setPendingUSDC] = useState(false);
    const [pendingUSDT, setPendingUSDT] = useState(false);
    const [pendingBUSD, setPendingBUSD] = useState(false);
    const [pendingFRAX, setPendingFRAX] = useState(false);
    const [pendingGZLP, setPendingGZLP] = useState(false);

    // wrapped in useMemo to prevent lpShareToWithdraw hook deps change on every render
    const userLpAmount = useBalanceOf();
    const userBalanceList = useUserBalances();
    const approveList = useAllowanceStables();
    const gzlpAllowance = useGzlpAllowance();

    const stableInputsSum =
        (parseFloat(props.dai) || 0) +
        (parseFloat(props.usdc) || 0) +
        (parseFloat(props.usdt) || 0) +
        (parseFloat(props.busd) || 0) +
        (parseFloat(props.frax) || 0);
    // user allowance
    const isApprovedTokens = useMemo(() => {
        return [
            approveList ? approveList[0].toNumber() > 0 : false,
            approveList ? approveList[1].toNumber() > 0 : false,
            approveList ? approveList[2].toNumber() > 0 : false,
            approveList ? approveList[3].toNumber() > 0 : false,
            approveList ? approveList[4].toNumber() > 0 : false,
        ];
    }, [approveList]);

    // max for withdraw or deposit
    const userMaxWithdraw = userLpAmount || BIG_ZERO;

    const userMaxWithdrawMinusInput =
        !userMaxWithdraw || userMaxWithdraw.toNumber() <= 0 || !userMaxWithdraw.toNumber()
            ? BIG_ZERO
            : new BigNumber(userMaxWithdraw.toNumber() - stableInputsSum);

    // max sums for deposit
    const userMaxDeposit = [
        (userBalanceList && userBalanceList[0].toNumber() > 0 && userBalanceList[0]) || BIG_ZERO,
        (userBalanceList && userBalanceList[1].toNumber() > 0 && userBalanceList[1]) || BIG_ZERO,
        (userBalanceList && userBalanceList[2].toNumber() > 0 && userBalanceList[2]) || BIG_ZERO,
        (userBalanceList && userBalanceList[3].toNumber() > 0 && userBalanceList[3]) || BIG_ZERO,
        (userBalanceList && userBalanceList[4].toNumber() > 0 && userBalanceList[4]) || BIG_ZERO,
    ];

    // final array both for deposit and withdraw
    const max = [
        action === 'deposit' ? userMaxDeposit[0] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[1] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[2] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[3] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[4] : userMaxWithdrawMinusInput,
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
            let address = usdtAddress;
            if (isBSC(chainId)) {
                address = bscUsdtAddress;
            }
            if (isPLG(chainId)) {
                address = plgUsdtAddress;
            }

            const tx = onApprove(address);
            if (!tx) {
                setPendingUSDT(false);
            }
        } catch (e) {
            setPendingUSDT(false);
        }

        setPendingUSDT(false);
    }, [onApprove, chainId]);

    const handleApproveFrax = useCallback(async () => {
        setPendingFRAX(true);

        try {
            let address = fraxAddress;
            const tx = onApprove(address);

            if (!tx) {
                setPendingFRAX(false);
            }
        } catch (e) {
            setPendingFRAX(false);
        }

        setPendingFRAX(false);
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

    const handleApproveBusd = useCallback(async () => {
        setPendingBUSD(true);
        log(`handleApproveBusd callback`);

        try {
            const tx = onApprove(busdAddress);
            if (!tx) {
                setPendingBUSD(false);
            }
        } catch (e) {
            setPendingBUSD(false);
        }

        setPendingBUSD(false);
    }, [onApprove]);

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

        return sharesAmount;
    }, [stableInputsSum, props.lpPrice, props.operationName]);

    const fullBalancetoWithdraw = useMemo(() => {
        const balance = getFullDisplayBalance(lpShareToWithdraw, 18);
        return balance;
    }, [lpShareToWithdraw, chainId]);

    // deposit and withdraw functions
    const depositExceedAmount =
        parseInt(props.dai) > getBalanceNumber(userBalanceList[0]).toNumber() ||
        parseInt(props.usdc) > getBalanceNumber(userBalanceList[1], 6).toNumber() ||
        parseInt(props.usdt) > getBalanceNumber(userBalanceList[2], 6).toNumber();

    const [pendingTx, setPendingTx] = useState(false);
    const [transactionId, setTransactionId] = useState(undefined);

    const { onStake } = useStake(
        [
            {
                name: 'DAI',
                value: props.dai === '' ? '0' : props.dai,
            },
            {
                name: 'USDC',
                value: props.usdc === '' ? '0' : props.usdc,
            },
            {
                name: 'USDT',
                value: props.usdt === '' ? '0' : props.usdt,
            },
            {
                name: 'BUSD',
                value: props.busd === '' ? '0' : props.busd,
            },
            {
                name: 'FRAX',
                value: props.frax === '' ? '0' : props.frax,
            },
        ],
        props.directOperation
    );

    const { onUnstake } = useUnstake(
        userLpAmount,
        !props.directOperation,
        props.sharePercent,
        props.directOperation && props.selectedCoinIndex === -1 ? 0 : props.selectedCoinIndex
    );

    // TODO: need detect canceled tx's by user
    const [transactionError, setTransactionError] = useState<TransactionError>();
    const emptyFunds = isETH(chainId)
        ? !Number(props.dai) && !Number(props.usdc) && !Number(props.usdt) && !Number(props.frax)
        : !Number(props.usdt) && !Number(props.busd);

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
                        props.usdt === '') &&
                    ((parseFloat(props.frax) > 0 && isApprovedTokens[4]) ||
                        props.frax === '0' ||
                        props.frax === '')
            );
        } else if (isBSC(chainId)) {
            let approveVal = false;

            if (props.operationName === 'withdraw') {
                approveVal = gzlpAllowance.isGreaterThanOrEqualTo(new BigNumber(APPROVE_SUM));

                log(`Withdrawal approve set to ${approveVal}, it's less than ${APPROVE_SUM}`);
            } else {
                if (props.busd !== '0') {
                    approveVal = isApprovedTokens[3];
                } else {
                    approveVal = isApprovedTokens[2];
                }
            }

            log(
                `Approved: ${approveVal}, GZLP allowance: ${gzlpAllowance.toNumber()}, USDT: ${parseFloat(
                    props.usdt
                )}, BUSD: ${parseFloat(props.busd)}`
            );

            setIsApproved(approveVal);
        } else if (isPLG(chainId)) {
            let approveVal = false;

            if (props.operationName === 'withdraw') {
                approveVal = gzlpAllowance.isGreaterThanOrEqualTo(new BigNumber(APPROVE_SUM));

                log(`Withdrawal approve set to ${approveVal}, it's less than ${APPROVE_SUM}`);
                setIsApproved(approveVal);
                return;
            }

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
        }
    }, [
        gzlpAllowance,
        props.operationName,
        chainId,
        approveList,
        props.usdc,
        props.dai,
        props.usdt,
        props.busd,
        props.frax,
        isApprovedTokens,
    ]);

    const validationError =
        action === 'deposit'
            ? getDepositValidationError(
                  props.dai,
                  props.usdc,
                  props.usdt,
                  props.frax,
                  isApproved,
                  depositExceedAmount
              )
            : isETH(chainId)
            ? getWithdrawValidationError(
                  props.dai,
                  props.usdc,
                  props.usdt,
                  fullBalanceLpShare,
                  userMaxWithdraw,
                  lpShareToWithdraw
              )
            : getBscWithdrawValidationError(isApproved, lpShareToWithdraw);

    const tempBlock = isBSC(chainId) || isPLG(chainId);
    const depositBlockHint = 'We have temporarily halted optimized deposits & withdrawals option due to the surge in gas prices. However, direct deposits & withdrawals are functioning as usual. Thank you!';
    const cantDeposit = emptyFunds || !isApproved || pendingTx || depositExceedAmount || tempBlock;
    const depositBlockHintRef = useRef(null);
    const [showHint, setShowHint] = useState(false);

    if (isETH(chainId)) {
        log(
            `Approved stables status: DAI: ${isApprovedTokens[0].toString()}, USDT: ${isApprovedTokens[1].toString()}, USDC: ${isApprovedTokens[2].toString()}, FRAX: ${isApprovedTokens[4].toString()}`
        );
    }

    if (isBSC(chainId)) {
        log(
            `Approved stables status: USDT: ${isApprovedTokens[1].toString()}, BUSD: ${isApprovedTokens[2].toString()}`
        );
    }

    if (isPLG(chainId)) {
        log(
            `Approved stables status: DAI: ${isApprovedTokens[0].toString()}, USDT: ${isApprovedTokens[1].toString()}, USDC: ${isApprovedTokens[2].toString()}`
        );
    }

    if (props.operationName === 'deposit') {
        log(
            `Can deposit: emptyFunds: ${emptyFunds}, isApproved: ${isApproved}, pendingTx: ${pendingTx}, depositExceedAmount: ${depositExceedAmount}`
        );
    }

    const canWithdraw = isETH(chainId)
        ? !validationError
        : // BSC withdraw only if there is a balance and approove granted
          userLpAmount.toNumber() > 0 && !validationError;

    if (props.operationName === 'withdraw') {
        log(`Can withdraw: ${canWithdraw}. Is approved: ${isApproved}`);

        if (validationError) {
            log(`Can't withdraw due to error: ${validationError}`);
        }
    }

    return (
        <div className={`Form Form-${props.operationName}`}>
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
                                href={`https://${getScanAddressByChainId(
                                    chainId
                                )}/tx/${transactionId}`}
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
                        parseInt(props.usdt, 10) +
                        parseInt(props.frax, 10);

                    switch (action) {
                        case 'withdraw':
                            if (!props.directOperation) {
                                return;
                            }

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
                                log(`Withdraw error: ${error.message}`);
                                setTransactionError(error);
                            }

                            if (props.onWithdraw) {
                                props.onWithdraw();
                            }

                            setPendingTx(false);
                            break;
                        case 'deposit':
                            if (!props.directOperation) {
                                return;
                            }

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
                                log(`Deposit error: ${error.message}`);
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
                    actions={[
                        {
                            name: 'deposit',
                            title: 'Deposit',
                            url: '/deposit',
                        },
                        {
                            name: 'withdraw',
                            title: 'Withdraw',
                            url: '/withdraw',
                        },
                    ]}
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
                            disabled={action === 'withdraw' || (action === 'deposit' && Number(props.frax) > 0)}
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
                            disabled={action === 'withdraw' || (action === 'deposit' && Number(props.frax) > 0)}
                            chainId={chainId}
                        />
                    )}
                    <Input
                        action={action}
                        name="USDT"
                        value={props.usdt}
                        handler={usdtInputHandler}
                        max={max[2]}
                        disabled={
                            action === 'withdraw' ||
                            (chainId === 56 && action === 'deposit' && Number(props.busd) > 0)
                            || ((action === 'deposit' && Number(props.frax) > 0))
                        }
                        chainId={chainId}
                    />
                    {chainId === 1 && (
                        <Input
                            action={action}
                            name="FRAX"
                            value={props.frax}
                            handler={fraxInputHandler}
                            max={max[4]}
                            disabled={
                                action === 'withdraw'
                            }
                            chainId={chainId}
                        />
                    )}
                    {chainId === 56 && action === 'deposit' && (
                        <Input
                            action={action}
                            name="BUSD"
                            value={props.busd}
                            handler={busdInputHandler}
                            max={max[3]}
                            chainId={chainId}
                            disabled={Number(props.usdt) > 0}
                        />
                    )}
                    {action === 'deposit' && (
                        <div className="deposit-action flex-wrap d-flex flex-row flex-wrap buttons align-items-center">
                            {account &&
                                parseFloat(props.dai) > 0 &&
                                !isApprovedTokens[0] &&
                                chainId === 1 && (
                                    <button
                                        disabled={pendingDAI || depositExceedAmount}
                                        onClick={handleApproveDai}
                                        type="button"
                                        className="mb-2"
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
                                        type="button"
                                        className="mb-2"
                                    >
                                        Approve USDC{' '}
                                    </button>
                                )}
                            {account && parseFloat(props.usdt) > 0 && !isApprovedTokens[2] && (
                                <button
                                    disabled={pendingUSDT || depositExceedAmount}
                                    onClick={handleApproveUsdt}
                                    type="button"
                                    className="mb-2"
                                >
                                    Approve USDT{' '}
                                </button>
                            )}
                            {account && parseFloat(props.busd) > 0 && !isApprovedTokens[3] && (
                                <button
                                    disabled={pendingBUSD || depositExceedAmount}
                                    onClick={handleApproveBusd}
                                    type="button"
                                    className="mb-2"
                                >
                                    Approve BUSD{' '}
                                </button>
                            )}
                            {account && parseFloat(props.frax) > 0 && !isApprovedTokens[4] && (
                                <button
                                    disabled={pendingFRAX || depositExceedAmount}
                                    onClick={handleApproveFrax}
                                    type="button"
                                    className="mb-2"
                                >
                                    Approve FRAX{' '}
                                </button>
                            )}
                            {account && (
                                <div className="deposit-button-wrapper flex-wrap flex-column flex-md-row align-items-center">
                                    {
                                        !props.directOperation &&
                                        <div ref={depositBlockHintRef} onClick={() => setShowHint(!showHint)}>
                                            <OverlayTrigger placement="right" overlay={<Tooltip>{depositBlockHint}</Tooltip>}>
                                                <button type="submit" className={`${!props.directOperation ? 'disabled' : ''}`}>
                                                    Deposit
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    }
                                    {
                                        props.directOperation &&
                                            <button type="submit" className={`${!props.directOperation ? 'disabled' : ''}`}>
                                                Deposit
                                            </button>
                                    }
                                  
                                    {!pendingTx && (
                                        <DirectAction
                                            actionName="deposit"
                                            checked={!props.directOperation}
                                            disabled={chainId !== 1 || parseFloat(props.frax) > 0}
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
                                    {props.slippage && (
                                        <div className="panel Slippage">
                                            <div className="panel-body">
                                                <span>Slippage: </span>
                                                <span
                                                    className={`text-${
                                                        Number(props.slippage) >= 0.4
                                                            ? 'danger'
                                                            : 'success'
                                                    }`}
                                                >
                                                    {props.slippage}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
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
                                <div className="deposit-button-wrapper flex-wrap">
                                    {account &&
                                        !isApproved &&
                                        Number(fullBalancetoWithdraw) > 0 &&
                                        chainId !== 1 && (
                                            <button
                                                disabled={pendingGZLP}
                                                onClick={handleApproveGzlp}
                                                className="me-2"
                                            >
                                                Approve GZLP
                                            </button>
                                        )}
                                    {
                                        !props.directOperation &&
                                        <div ref={depositBlockHintRef} onClick={() => setShowHint(!showHint)}>
                                            <OverlayTrigger placement="right" overlay={<Tooltip>{depositBlockHint}</Tooltip>}>
                                                <button type="submit" className={`${!props.directOperation ? 'disabled' : ''}`}>
                                                    Withdraw
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    }
                                    {
                                        props.directOperation &&
                                            <button type="submit" className={`${!canWithdraw ? 'disabled' : ''}`}>
                                                Withdraw
                                            </button>
                                    }
                                    {/* <button
                                        type="submit"
                                        className={`${!canWithdraw ? 'disabled' : ''}`}
                                    >
                                        Withdraw
                                    </button> */}
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
                    {validationError && props.operationName === 'withdraw' && (
                        <div className={'mt-2 text-danger error withdraw-error'}>
                            {validationError}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
