import {useCallback, useMemo, useState, useRef} from 'react';
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
// import useLpPrice from "../../hooks/useLpPrice";
import useUserLpAmount from "../../hooks/useUserLpAmount";
import useApprove from "../../hooks/useApprove";
import useStake from "../../hooks/useStake";
import useUnstake from "../../hooks/useUnstake";
import {useWallet} from "use-wallet";
import {BigNumber} from "bignumber.js";
import {Modal,Button,Tooltip,OverlayTrigger,Toast,ToastContainer} from "react-bootstrap";
import {NoWallet} from "../NoWallet/NoWallet"

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
        error = 'You\'re trying to deposit more than you have';
    } else if (!isApproved) {
        error = 'You have to approve your funds before the deposit';
    } else if (pendingTx) {
        error = 'You can\'t deposit because have a pending transaction';
    }

    return error;
}

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
        error = 'You\'re trying to withdraw more than you have';
    } else if (fullBalanceLpShare === '0') {
        error = 'You have zero LP shares';
    }

    return error;
}

export const Form = (props: FormProps): JSX.Element => {
    const [action, setAction] = useState('deposit');
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
    const stableInputsSum = (parseFloat(dai) || 0) + (parseFloat(usdc) || 0) + (parseFloat(usdt) || 0);
    // user allowance
    const isApprovedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
    ];
    const isApproved = approveList &&
        (((parseFloat(dai) > 0 && isApprovedTokens[0]) || dai === '0' || dai === '')
            && ((parseFloat(usdc) > 0 && isApprovedTokens[1]) || usdc === '0' || usdc === '')
            && ((parseFloat(usdt) > 0 && isApprovedTokens[2]) || usdt === '0' || usdt === ''));
    // max for withdraw or deposit
    const userMaxWithdraw = lpPrice.multipliedBy(userLpAmount) || BIG_ZERO;
    const userMaxWithdrawMinusInput = (!userMaxWithdraw || userMaxWithdraw.toNumber() <= 0 || !userMaxWithdraw.toNumber()) ? BIG_ZERO
        : new BigNumber(userMaxWithdraw.toNumber() - stableInputsSum);
    const userMaxDeposit = [
        (userBalanceList && userBalanceList[0].toNumber() > 0 && userBalanceList[0]) || BIG_ZERO,
        (userBalanceList && userBalanceList[1].toNumber() > 0 && userBalanceList[1]) || BIG_ZERO,
        (userBalanceList && userBalanceList[2].toNumber() > 0 && userBalanceList[2]) || BIG_ZERO
    ];
    const max = [
        action === 'deposit' ? userMaxDeposit[0] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[1] : userMaxWithdrawMinusInput,
        action === 'deposit' ? userMaxDeposit[2] : userMaxWithdrawMinusInput,
    ];

    // approves
    const {onApprove} = useApprove();
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
    const depositExceedAmount = parseInt(dai) > getBalanceNumber(userBalanceList[0])
        || parseInt(usdc) > getBalanceNumber(userBalanceList[1], 6)
        || parseInt(usdt) > getBalanceNumber(userBalanceList[2], 6);
    const [pendingTx, setPendingTx] = useState(false);
    const [pendingWithdraw, setPendingWithdraw] = useState(false);
    const {onStake} = useStake(dai === '' ? '0' : dai, usdc === '' ? '0' : usdc, usdt === '' ? '0' : usdt);
    const {onUnstake} = useUnstake(fullBalancetoWithdraw, dai === '' ? '0' : dai, usdc === '' ? '0' : usdc, usdt === '' ? '0' : usdt);

    // user wallet
    const {account} = useWallet();

    // TODO: need detect canceled tx's by user
    const [transactionError, setTransactionError] = useState<TransactionError>();

    const [showModal, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const canDeposit = (dai === '' && usdc === '' && usdt === '') || !isApproved || pendingTx || depositExceedAmount;
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    if (!account) {
        return (
            <NoWallet />
        );
    }

    const validationError = action === 'deposit'
        ? getDepositValidationError(dai, usdc, usdt, isApproved, pendingTx, depositExceedAmount)
        : getWithdrawValidationError(dai, usdc, usdt, fullBalanceLpShare, userMaxWithdraw, lpShareToWithdraw);

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
                    Please note. This is a beta version. The contract has not been auditied yet. Use it at your own risk.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary" onClick={async () => {
                            setModalShow(false);
                            setPendingTx(true);
                            await onStake();
                            setPendingTx(false);
                        }}
                    >Understood</Button>
                </Modal.Footer>
            </Modal>
            {
                transactionError &&
                    <ToastContainer position={'top-end'} className={'mt-3 me-3'}>
                        <Toast onClose={() => setTransactionError(undefined)} delay={5000} autohide>
                            <Toast.Header>
                                <strong className="me-auto">Error</strong>
                                <small>now</small>
                            </Toast.Header>
                            <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                        </Toast>
                    </ToastContainer>
            }
            <form>
                <div className="ActionSelector">
                    <div
                        className={`ActionSelector__Action ${action === 'deposit' ? 'ActionSelector__Action__Active' : ''}`}
                        onClick={e => { setAction('deposit') }}
                    >
                        <span>Deposit</span>
                        <svg width="54" height="38" viewBox="0 0 54 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill={`${action === 'deposit' ? '#ffffff' : '#F1DEAE'}`}
                                fillRule="evenodd"
                                clipRule="evenodd" d="M2.1139 37.3535C1.85338 37.3541 1.58905 37.3107 1.33379 37.2198C0.449276 36.8997 -0.0982817 36.0674 0.0140383 35.2095C1.64592 23.076 10.559 13.1866 22.4561 9.0022C22.9994 8.81113 23.538 8.69588 24.0657 8.6492C26.0438 8.05204 28.096 7.6087 30.2039 7.33405C31.8622 7.11797 33.1742 5.75171 33.1742 4.07937C33.1742 1.26238 34.934 0.000471356 36.6798 0.000471508C37.8202 0.000471608 38.9605 0.497584 40.0587 1.49182L52.0255 12.3264C54.6582 14.71 54.6582 18.5722 52.0255 20.9558L40.0587 31.7904C38.9605 32.7718 37.8202 33.2817 36.6798 33.2817C34.934 33.2817 33.1742 32.0198 33.1742 29.2028C33.1742 27.3119 31.8083 25.6722 29.921 25.5554C29.2508 25.5139 28.5798 25.4936 27.9088 25.4936C18.4339 25.4936 9.4236 29.6362 3.82032 36.5703C3.41494 37.075 2.77612 37.355 2.1139 37.3535Z"
                            />
                        </svg>
                    </div>
                    <div
                        className={`ActionSelector__Action ${action === 'withdraw' ? 'ActionSelector__Action__Active' : ''}`}
                        onClick={e => { setAction('withdraw') }}
                    >
                        <span>Withdraw</span>
                        <svg width="54" height="38" viewBox="0 0 54 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill={`${action === 'withdraw' ? '#ffffff' : '#F1DEAE'}`}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M51.8861 6.32103e-06C52.1466 -0.000602781 52.4109 0.0428003 52.6662 0.133738C53.5507 0.453845 54.0983 1.28612 53.986 2.14401C52.3541 14.2775 43.441 24.167 31.5439 28.3513C31.0006 28.5424 30.462 28.6576 29.9343 28.7043C27.9562 29.3015 25.904 29.7448 23.7962 30.0195C22.1378 30.2355 20.8258 31.6018 20.8258 33.2741C20.8258 36.0911 19.066 37.353 17.3202 37.353C16.1798 37.353 15.0395 36.8559 13.9413 35.8617L1.97452 25.0271C-0.658175 22.6435 -0.658175 18.7813 1.97452 16.3977L13.9413 5.56316C15.0395 4.58168 16.1798 4.07182 17.3202 4.07182C19.066 4.07182 20.8258 5.33373 20.8258 8.15071C20.8258 10.0416 22.1917 11.6813 24.079 11.7981C24.7492 11.8396 25.4202 11.86 26.0912 11.86C35.5661 11.86 44.5764 7.71733 50.1797 0.783208C50.5851 0.278552 51.2239 -0.00153313 51.8861 6.32103e-06Z"
                            />
                        </svg>
                    </div>
                </div>
                <Input name="DAI" value={dai} handler={daiInputHandler} max={max[0]}/>
                <Input name="USDC" value={usdc} handler={usdcInputHandler} max={max[1]}/>
                <Input name="USDT" value={usdt} handler={usdtInputHandler} max={max[2]}/>
                {action === 'deposit' &&
                <div className="d-flex flex-row flex-wrap buttons">
                    {account && parseFloat(dai) > 0 && !isApprovedTokens[0] &&
                    <button disabled={pendingDAI || depositExceedAmount} onClick={handleApproveDai}>Approve DAI </button>
                    }
                    {account && parseFloat(usdc) > 0 && !isApprovedTokens[1] &&
                    <button disabled={pendingUSDC || depositExceedAmount} onClick={handleApproveUsdc}>Approve USDC </button>
                    }
                    {account && parseFloat(usdt) > 0 && !isApprovedTokens[2] &&
                    <button disabled={pendingUSDT || depositExceedAmount} onClick={handleApproveUsdt}>Approve USDT </button>
                    }
                    {account &&
                        <div className="deposit-button-wrapper">
                            <button
                                className={'disabled'}
                                onClick={(e) => e.preventDefault()}
                            >
                                Deposit
                            </button>
                            <div className="direct-deposit">
                                <input type="checkbox" />
                                <span>Direct deposit</span>
                                <div
                                    ref={target}
                                    onClick={() => setShowHint(!showHint)}
                                >
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={
                                            <Tooltip>When using direct deposit / withdrawal, funds will be credited instantly, but the cost of such a transaction will be many times more expensive</Tooltip>
                                        }
                                    >
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7.31725 0.76563C11.1464 0.761233 14.2568 3.86941 14.2524 7.69858C14.248 11.5211 11.1376 14.6161 7.28428 14.592C3.47929 14.5678 0.437059 11.5036 0.42387 7.70077C0.410681 3.876 3.51007 0.770026 7.31725 0.76563ZM5.20483 11.8399C5.20264 11.8531 5.20044 11.8685 5.20044 11.8838C5.22462 12.3301 5.52137 12.6356 5.96759 12.6488C6.09069 12.6532 6.21598 12.64 6.33468 12.6114C7.35242 12.3784 8.18552 11.7937 9.00323 11.1848C9.11533 11.1013 9.13072 10.9782 9.09115 10.8507C9.00982 10.5979 8.76583 10.488 8.50865 10.6045C8.28883 10.7056 8.0822 10.8265 7.86459 10.9298H7.86239C7.73929 10.987 7.60521 10.8705 7.64038 10.7408C7.64038 10.7386 7.64038 10.7386 7.64038 10.7364C8.06462 9.27025 8.49326 7.80409 8.9219 6.34012C9.05818 5.87412 8.81858 5.51362 8.33719 5.46526C8.29103 5.46087 8.24267 5.46306 8.19651 5.46526C7.66456 5.48944 7.16778 5.63452 6.69298 5.87192C6.24895 6.09393 5.84889 6.38409 5.47301 6.70721C5.34112 6.81932 5.28177 6.97319 5.33233 7.13585C5.38069 7.28752 5.53236 7.3183 5.67524 7.34028C5.82471 7.36226 5.95 7.30071 6.0797 7.23916C6.21158 7.17542 6.34347 7.10727 6.47976 7.05892C6.59626 7.01935 6.62923 7.05672 6.60285 7.17542C6.59186 7.22597 6.57648 7.27653 6.56109 7.32709C6.13245 8.7317 5.70161 10.1341 5.27298 11.5387C5.2466 11.6355 5.22682 11.7388 5.20483 11.8399ZM8.15255 3.96393C8.15255 3.95953 8.15255 3.95514 8.15255 3.95074C8.14595 3.41659 7.98549 3.0473 7.56784 2.82749C7.0227 2.53953 6.38744 2.82529 6.23137 3.42099C6.15223 3.72213 6.15883 4.02328 6.23576 4.32662C6.33248 4.7135 6.57208 4.95969 6.96335 5.02563C7.35902 5.09158 7.69973 4.96628 7.93273 4.62557C8.0822 4.40356 8.14155 4.15077 8.15255 3.96393Z"
                                                fill="#B4B4B4"
                                            />
                                        </svg>
                                    </OverlayTrigger>
                                </div>

                            </div>
                        </div>
                    }
                    {
                        validationError &&
                            <div className={'mt-2 text-danger error'}>{validationError}</div>
                    }
                </div>
                }
                {action === 'withdraw' &&
                <div>
                    {account &&
                        <div className="deposit-button-wrapper">
                            <button
                                onClick={async () => {
                                    setPendingWithdraw(true);

                                    try {
                                        await onUnstake();
                                    } catch (error: any) {
                                        setPendingWithdraw(false);
                                        setTransactionError(error);
                                    }

                                    setPendingWithdraw(false);
                                }}
                                disabled={(dai === '' && usdc === '' && usdt === '') || pendingWithdraw
                                || fullBalanceLpShare === '0' || userMaxWithdraw.toNumber() < lpShareToWithdraw.toNumber()}
                            >
                                Withdraw
                            </button>
                            <div className="direct-deposit">
                                <input type="checkbox" />
                                <span>Direct withdraw</span>
                                <div
                                    ref={target}
                                    onClick={() => setShowHint(!showHint)}
                                >
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={
                                            <Tooltip>
                                                When using direct deposit / withdrawal, funds will be credited instantly, 
                                                but the cost of such a transaction will be many times more expensive
                                            </Tooltip>
                                        }
                                    >
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7.31725 0.76563C11.1464 0.761233 14.2568 3.86941 14.2524 7.69858C14.248 11.5211 11.1376 14.6161 7.28428 14.592C3.47929 14.5678 0.437059 11.5036 0.42387 7.70077C0.410681 3.876 3.51007 0.770026 7.31725 0.76563ZM5.20483 11.8399C5.20264 11.8531 5.20044 11.8685 5.20044 11.8838C5.22462 12.3301 5.52137 12.6356 5.96759 12.6488C6.09069 12.6532 6.21598 12.64 6.33468 12.6114C7.35242 12.3784 8.18552 11.7937 9.00323 11.1848C9.11533 11.1013 9.13072 10.9782 9.09115 10.8507C9.00982 10.5979 8.76583 10.488 8.50865 10.6045C8.28883 10.7056 8.0822 10.8265 7.86459 10.9298H7.86239C7.73929 10.987 7.60521 10.8705 7.64038 10.7408C7.64038 10.7386 7.64038 10.7386 7.64038 10.7364C8.06462 9.27025 8.49326 7.80409 8.9219 6.34012C9.05818 5.87412 8.81858 5.51362 8.33719 5.46526C8.29103 5.46087 8.24267 5.46306 8.19651 5.46526C7.66456 5.48944 7.16778 5.63452 6.69298 5.87192C6.24895 6.09393 5.84889 6.38409 5.47301 6.70721C5.34112 6.81932 5.28177 6.97319 5.33233 7.13585C5.38069 7.28752 5.53236 7.3183 5.67524 7.34028C5.82471 7.36226 5.95 7.30071 6.0797 7.23916C6.21158 7.17542 6.34347 7.10727 6.47976 7.05892C6.59626 7.01935 6.62923 7.05672 6.60285 7.17542C6.59186 7.22597 6.57648 7.27653 6.56109 7.32709C6.13245 8.7317 5.70161 10.1341 5.27298 11.5387C5.2466 11.6355 5.22682 11.7388 5.20483 11.8399ZM8.15255 3.96393C8.15255 3.95953 8.15255 3.95514 8.15255 3.95074C8.14595 3.41659 7.98549 3.0473 7.56784 2.82749C7.0227 2.53953 6.38744 2.82529 6.23137 3.42099C6.15223 3.72213 6.15883 4.02328 6.23576 4.32662C6.33248 4.7135 6.57208 4.95969 6.96335 5.02563C7.35902 5.09158 7.69973 4.96628 7.93273 4.62557C8.0822 4.40356 8.14155 4.15077 8.15255 3.96393Z"
                                                fill="#B4B4B4"
                                            />
                                        </svg>
                                    </OverlayTrigger>
                                </div>

                            </div>
                        </div>
                    }
                    {
                        pendingWithdraw &&
                            <div className={'d-flex align-items-center'}>
                                <div>Please, approve the transaction</div>
                                <div className={'preloader ms-2'}></div>
                            </div>
                    }
                </div>
                }
            </form>
        </div>
    );
};
