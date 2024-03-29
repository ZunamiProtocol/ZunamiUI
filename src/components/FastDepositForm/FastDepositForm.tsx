import './FastDepositForm.scss';
import { useState, useMemo, useEffect } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { useAllowanceStables } from '../../hooks/useAllowance';
import useStake from '../../hooks/useStake';
import { getActiveWalletName } from '../WalletsModal/WalletsModal';
import {
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
    fraxAddress,
    BIG_TEN,
    UZD_DECIMALS,
    BIG_ZERO,
} from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { useWallet } from 'use-wallet';
import { log } from '../../utils/logger';
import { isBSC, isETH, isPLG } from '../../utils/zunami';
import { ActionSelector } from '../Form/ActionSelector/ActionSelector';
import useApproveUzd from '../../hooks/useApproveUzd';
import useApproveZeth from '../../hooks/useApproveZeth';
import { contractAddresses } from '../../sushi/lib/constants';
import useZapsLpBalance from '../../hooks/useZapsLpBalance';
import BigNumber from 'bignumber.js';
import useZethApsBalance from '../../hooks/useZethApsBalance';
import useApproveZAPSLP from '../../hooks/useApproveZAPSLP';
import useApproveLP from '../../hooks/useApproveLP';

function coinNameToAddress(coinName: string, chainId: number): string {
    if (chainId === 56 && coinName === 'USDT') {
        return bscUsdtAddress;
    }

    let address = daiAddress;

    switch (coinName) {
        case 'USDC':
            address = usdcAddress;
            break;
        case 'USDT':
            address = isPLG(chainId) ? plgUsdtAddress : usdtAddress;
            break;
        case 'BUSD':
            address = busdAddress;
            break;
        case 'FRAX':
            address = fraxAddress;
            break;
        case 'UZD':
            address = contractAddresses.uzd[1];
            break;
        case 'LP':
            address = contractAddresses.aps[1];
            break;
        case 'ethZAPSLP':
            address = contractAddresses.zethAPS[1];
            break;
    }

    return address;
}

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

function renderToasts(
    transactionError: boolean,
    setTransactionError: Function,
    chainId: number | undefined,
    transactionId: string | undefined,
    setTransactionId: Function
) {
    return (
        <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
            {transactionError && (
                <Toast onClose={() => setTransactionError(false)} delay={5000} autohide>
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
                            href={`https://${getScanAddressByChainId(chainId)}/tx/${transactionId}`}
                        >
                            transaction
                        </a>
                    </Toast.Body>
                </Toast>
            )}
        </ToastContainer>
    );
}

interface FastDepositFormProps {
    stakingMode: string;
}

export const FastDepositForm: React.FC<FastDepositFormProps & React.HTMLProps<HTMLDivElement>> = ({
    stakingMode,
    className,
}) => {
    const userBalanceList = useUserBalances();
    const { chainId, account } = useWallet();
    const [optimized, setOptimized] = useState(true);
    const [pendingApproval, setPendingApproval] = useState(false);
    const [coin, setCoin] = useState(stakingMode === 'UZD' ? 'UZD' : 'ZETH');
    const [depositSum, setDepositSum] = useState('');
    const [withdrawSum, setWithdrawSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [coinIndex, setCoinIndex] = useState(-1);
    const approveList = useAllowanceStables();
    // APS balance
    const apsBalance = useZapsLpBalance();
    // ZETH APS balance
    const zethApsBalance = useZethApsBalance();
    const approvedTokens = useMemo(() => {
        return [
            approveList ? approveList[0].toNumber() > 0 : false,
            approveList ? approveList[1].toNumber() > 0 : false,
            approveList ? approveList[2].toNumber() > 0 : false,
            approveList ? approveList[3].toNumber() > 0 : false,
            approveList ? approveList[4].toNumber() > 0 : false,
            approveList ? approveList[5].toNumber() > 0 : false, // UZD
            approveList ? approveList[6].toNumber() > 0 : false, // ZETH
            approveList ? approveList[7].toNumber() > 0 : false, // ethZAPSLP
            approveList ? approveList[8].toNumber() > 0 : false, // APSLP
        ];
    }, [approveList]);

    const coins = useMemo(() => {
        return ['DAI', 'USDC', 'USDT', 'BUSD', 'FRAX', 'UZD', 'ZETH', 'ethZAPSLP', 'ZAPSLP'];
    }, []);

    const { onUzdApprove } = useApproveUzd();
    const { onZethApprove } = useApproveZeth();
    const { onLPApprove } = useApproveLP();
    const { onZAPSLPApprove } = useApproveZAPSLP();
    const { onStake } = useStake(
        [
            {
                name: 'DAI',
                value: coin === 'DAI' ? depositSum : '0',
            },
            {
                name: 'USDC',
                value: coin === 'USDC' ? depositSum : '0',
            },
            {
                name: 'USDT',
                value: coin === 'USDT' ? depositSum : '0',
            },
            {
                name: 'BUSD',
                value: coin === 'BUSD' ? depositSum : '0',
            },
            {
                name: 'FRAX',
                value: coin === 'FRAX' ? depositSum : '0',
            },
            {
                name: 'UZD',
                value: coin === 'UZD' ? depositSum : '0',
            },
            {
                name: 'ZETH',
                value: coin === 'ZETH' ? depositSum : '0',
            },
        ],
        !optimized
    );

    const [action, setAction] = useState('deposit');

    useEffect(() => {
        if (action === 'withdraw') {
            setWithdrawSum('');
        }
    }, [stakingMode, action]);

    useEffect(() => {
        let preselectedCoin = stakingMode === 'UZD' ? 'UZD' : 'ZETH';

        if (action === 'withdraw' && stakingMode === 'ZETH') {
            preselectedCoin = 'ethZAPSLP';
        }

        if (action === 'withdraw' && stakingMode === 'UZD') {
            preselectedCoin = 'ZAPSLP';
        }

        setCoin(preselectedCoin);
        setCoinIndex(coins.indexOf(preselectedCoin));

        if (preselectedCoin === 'UZD') {
            setOptimized(false);
        }
    }, [stakingMode, coins, action]);

    // get user max balance
    const fullBalance = useMemo(() => {
        let decimalPlaces = 18;

        if (userBalanceList[coinIndex] && !userBalanceList[coinIndex].toNumber()) {
            decimalPlaces = 0;
        }

        if (isBSC(chainId)) {
            return BIG_ZERO;
            // return getFullDisplayBalance(userBalanceList[coinIndex], decimalPlaces);
        } else if (isETH(chainId)) {
            const isDaiOrFrax = ['DAI', 'FRAX'].indexOf(coin) !== -1;

            if (coin === 'UZD') {
                return getFullDisplayBalance(userBalanceList[coinIndex], 18, decimalPlaces);
            } else if (coin === 'ZETH') {
                return getFullDisplayBalance(userBalanceList[coinIndex], 18, decimalPlaces);
            }

            return getFullDisplayBalance(userBalanceList[coinIndex], isDaiOrFrax ? 18 : 6);
        } else if (isPLG(chainId)) {
            return BIG_ZERO;
            // return getFullDisplayBalance(userBalanceList[coinIndex], coin === 'DAI' ? 18 : 6);
        }
    }, [userBalanceList, coin, coinIndex, chainId]);

    const coinApproved = useMemo(() => {
        if (action === 'deposit') {
            return approvedTokens[coinIndex];
        } else {
            return approvedTokens[coinIndex];
        }
    }, [approvedTokens, coinIndex, action]);

    const showApproveBtn = useMemo(() => {
        let result = !coinApproved;

        if (!isETH(chainId)) {
            result = false;
        }

        return result;
    }, [chainId, coinApproved]);

    const approveEnabled = useMemo(() => {
        let result = true;

        if (action === 'deposit' && !Number(depositSum)) {
            return false;
        }

        if (action === 'withdraw' && !Number(withdrawSum)) {
            return false;
        }

        return result;
    }, [action, withdrawSum, depositSum]);

    const depositEnabled = useMemo(() => {
        let result =
            coinApproved &&
            Number(depositSum) > 0 &&
            !pendingApproval &&
            Number(depositSum) <= Number(fullBalance);

        return result;
    }, [coinApproved, depositSum, pendingApproval, fullBalance]);

    const withdrawEnabled = useMemo(() => {
        let result = true;

        if (coin === 'UZD' && !apsBalance.toNumber()) {
            result = false;
        }

        if (!Number(withdrawSum)) {
            result = false;
        }

        return result;
    }, [apsBalance, coin, withdrawSum]);

    const depositValidationError = useMemo(() => {
        let message = '';

        if (Number(depositSum) >= Number(fullBalance)) {
            // debugger;
            message = "You're trying to deposit more than you have";
        }

        if (pendingApproval) {
            message = 'Please, wait for transaction to finish...';
        }

        if (Number(depositSum) === 0) {
            message = 'Please, enter a value more than a zero';
        }

        return message;
    }, [depositSum, fullBalance, pendingApproval]);

    // set default input to max
    useEffect(() => {
        if (!fullBalance) {
            return;
        }

        setDepositSum(fullBalance.toString());
    }, [fullBalance]);

    useEffect(() => {
        if (action === 'withdraw' && withdrawSum === '') {
            let decimalPlaces = 18;

            if (stakingMode === 'UZD') {
                if (!apsBalance.toNumber()) {
                    decimalPlaces = 0;
                }

                setWithdrawSum(getFullDisplayBalance(apsBalance, 18, decimalPlaces));
            }

            if (stakingMode === 'ZETH') {
                if (!zethApsBalance.toNumber()) {
                    decimalPlaces = 0;
                }

                setWithdrawSum(getFullDisplayBalance(zethApsBalance, 18, decimalPlaces));
            }
        }
    }, [action, apsBalance, zethApsBalance, withdrawSum, stakingMode]);

    const maxInputSum = useMemo(() => {
        let result = BIG_ZERO;

        if (!isETH(chainId)) {
            return BIG_ZERO;
        }

        if (stakingMode === 'UZD') {
            if (action === 'deposit') {
                result = userBalanceList[coinIndex];
            } else {
                result = apsBalance;
            }
        }

        if (stakingMode === 'ZETH') {
            if (action === 'deposit') {
                result = userBalanceList[coinIndex];
            } else {
                result = zethApsBalance;
            }
        }

        return result;
    }, [action, stakingMode, coinIndex, userBalanceList, zethApsBalance, apsBalance, chainId]);

    return (
        <div className={`FastDepositForm ${className} mode-${stakingMode}`}>
            {renderToasts(
                transactionError,
                setTransactionError,
                chainId,
                transactionId,
                setTransactionId
            )}
            <div className="d-flex justify-content-between align-items-center">
                <span className="FastDepositForm__Title">
                    <div className="">
                        <ActionSelector
                            value={action}
                            actions={[
                                {
                                    name: 'deposit',
                                    title: 'Deposit',
                                },
                                {
                                    name: 'withdraw',
                                    title: 'Withdraw',
                                },
                            ]}
                            onChange={(action: string) => {
                                setAction(action);
                            }}
                        />
                    </div>
                </span>
                <div className="FastDepositForm__Description">
                    {stakingMode === 'UZD' && (
                        <svg
                            width="120"
                            height="24"
                            viewBox="0 0 120 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M66.7179 4.5728L67.3246 3.96607C67.3904 3.90028 67.4685 3.84809 67.5545 3.81248C67.6405 3.77687 67.7326 3.75854 67.8256 3.75854C67.9187 3.75854 68.0108 3.77687 68.0968 3.81248C68.1827 3.84809 68.2608 3.90028 68.3266 3.96607L68.9334 4.5728C68.9992 4.6386 69.0514 4.7167 69.087 4.80266C69.1226 4.88863 69.1409 4.98076 69.1409 5.0738C69.1409 5.16685 69.1226 5.25898 69.087 5.34494C69.0514 5.43091 68.9992 5.50901 68.9334 5.57481L68.3266 6.18154C68.2608 6.24733 68.1827 6.29952 68.0968 6.33513C68.0108 6.37074 67.9187 6.38906 67.8256 6.38906C67.7326 6.38906 67.6405 6.37074 67.5545 6.33513C67.4685 6.29952 67.3904 6.24733 67.3246 6.18154L66.7179 5.57481C66.585 5.44193 66.5104 5.26172 66.5104 5.0738C66.5104 4.88589 66.585 4.70568 66.7179 4.5728ZM66.6881 17.6905V7.45201H68.9632V17.6905H66.6881Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M60.6025 7.16431C59.1631 7.16431 57.8717 7.86769 56.986 8.98319C56.5337 8.41539 55.9591 7.95696 55.3051 7.64204C54.651 7.32712 53.9343 7.16382 53.2084 7.16431C52.8376 7.16409 52.4682 7.21144 52.1095 7.30519C51.7846 7.39205 51.4835 7.5509 51.2285 7.76996C50.9734 7.98902 50.7709 8.26268 50.636 8.57065V7.44685H49.5664V7.44857H48.3737V17.687H50.6488V12.5678C50.6488 10.6832 51.7946 9.15515 53.2084 9.15515C54.622 9.15515 55.768 10.4286 55.768 11.9993V17.687H58.0431V12.5678C58.0431 10.6832 59.1889 9.15515 60.6025 9.15515C62.0163 9.15515 63.1621 10.4286 63.1621 11.9993V17.687H65.4372V11.9993C65.4373 11.3643 65.3123 10.7356 65.0693 10.149C64.8264 9.56236 64.4703 9.02934 64.0213 8.58037C63.5724 8.13139 63.0394 7.77524 62.4528 7.53228C61.8661 7.28931 61.2374 7.16427 60.6025 7.16431Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M45.7445 7.4486V7.44687H44.6749V8.78045C44.4345 8.30528 44.0356 7.92904 43.5472 7.71681C42.6973 7.34973 41.7809 7.16167 40.855 7.16433C37.4785 7.16433 34.7409 9.58332 34.7409 12.5678C34.7409 15.5518 36.9052 17.9713 39.5756 17.9713C42.2458 17.9713 44.2876 15.807 44.2876 13.1363H42.0122C42.0122 13.8597 41.9095 14.555 41.5093 15.0569C41.2779 15.3472 40.9836 15.5811 40.6486 15.7411C40.3137 15.9011 39.9468 15.9829 39.5756 15.9805C38.1618 15.9805 37.016 14.4524 37.016 12.5678C37.016 10.6833 38.7353 9.15518 40.855 9.15518C42.9755 9.15518 44.6946 10.6833 44.6946 12.5678V17.687H46.9697V7.4486H45.7445Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M29.0962 7.16445C28.151 7.15827 27.215 7.35112 26.3493 7.73047C25.8667 7.94583 25.4752 8.32425 25.2438 8.79937V7.44699H24.1742V7.44872H22.9582V17.6872H25.2333V12.5679C25.2333 10.6834 26.9526 9.15529 29.0723 9.15529C30.4859 9.15529 31.6317 10.4287 31.6317 11.9994V17.6872H33.9068V12.014C33.9089 10.7339 33.404 9.50503 32.5025 8.59624C31.6009 7.68744 30.3762 7.17265 29.0962 7.16445Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M19.279 7.44946V12.5687C19.279 14.4532 17.5596 15.9813 15.4402 15.9813C14.0264 15.9813 12.8806 14.7079 12.8806 13.1372V7.44946H10.6055V13.1227C10.6035 14.4027 11.1084 15.6315 12.0099 16.5403C12.9114 17.4491 14.1361 17.9639 15.4161 17.9722C16.3613 17.9784 17.2973 17.7855 18.163 17.4061C18.646 17.1904 19.0376 16.8116 19.2693 16.3361V17.6879H21.5541V7.44946H19.279Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M0 8.55684V9.46551H6.19105L0 15.6211V17.6788H9.40386V15.6211H8.83835V15.6208H3.4169L3.75526 15.2317C3.77746 15.2083 3.79939 15.1847 3.82063 15.1604L4.43238 14.4613L9.40386 9.37047V7.4541H0V8.55684Z"
                                fill="white"
                                className="letter"
                            />
                            <path
                                d="M119.999 11.9044L120 11.4071C120.002 7.6115 120.004 4.61346 118.568 2.6861C118.057 2.00762 117.393 1.45038 116.624 1.05745C115.507 0.45346 114.414 0.303736 113.449 0.171559L113.372 0.161325C112.49 0.0473861 111.602 -0.00665726 110.713 0.000653686H85.2867C84.3977 -0.00665726 83.5095 0.0473876 82.6281 0.161324L82.5503 0.171558C81.5859 0.303735 80.4932 0.453458 79.3763 1.05745C78.6073 1.45038 77.9422 2.00762 77.4317 2.6861C75.9954 4.61345 75.9975 7.61149 76.0002 11.4071L76.0005 11.9044L76.0002 12.4018C75.9975 16.1973 75.9954 19.1954 77.4318 21.1227C77.9422 21.8012 78.6073 22.3584 79.3763 22.7514C80.4932 23.3554 81.5859 23.5051 82.5503 23.6373L82.6281 23.6475C83.5095 23.7614 84.3977 23.8155 85.2867 23.8082H110.713C111.602 23.8155 112.49 23.7614 113.372 23.6475L113.449 23.6373C114.414 23.5051 115.507 23.3554 116.624 22.7514C117.393 22.3584 118.057 21.8012 118.568 21.1227C120.004 19.1954 120.002 16.1973 120 12.4018L119.999 11.9044Z"
                                fill="url(#paint0_linear_0_0)"
                            />
                            <path
                                d="M90.2342 7.54419V12.2394C90.2342 13.9678 88.6438 15.3693 86.6832 15.3693C85.3754 15.3693 84.3156 14.2014 84.3156 12.7608V7.54419H82.211V12.7475C82.2091 13.9215 82.6762 15.0485 83.5101 15.882C84.344 16.7155 85.4769 17.1877 86.661 17.1953C87.5353 17.2009 88.4011 17.024 89.2019 16.6761C89.6512 16.4771 90.0149 16.127 90.2289 15.6876V16.9305H90.2342V16.9345H92.3387V7.54419H90.2342Z"
                                fill="white"
                            />
                            <path
                                d="M111.162 4.41553V4.41589H111.159V8.79676C110.906 8.36237 110.518 8.0206 110.053 7.82231C109.286 7.47547 108.454 7.2922 107.611 7.28435C104.488 7.28435 101.956 9.50263 101.956 12.2395C101.956 14.9759 103.958 17.1946 106.427 17.1946C107.015 17.1947 107.596 17.08 108.139 16.8572C108.681 16.6344 109.174 16.3078 109.589 15.896C110.005 15.4843 110.334 14.9955 110.559 14.4576C110.783 13.9196 110.899 13.3431 110.899 12.7608H108.794C108.794 14.2012 107.735 15.369 106.427 15.369C105.12 15.369 104.06 13.9677 104.06 12.2395C104.06 10.5113 105.65 9.11 107.611 9.11C109.572 9.11 111.162 10.5113 111.162 12.2395V16.934H113.266V4.41553H111.162Z"
                                fill="white"
                            />
                            <path
                                d="M93.2414 8.55562V9.38663H98.9519L93.2414 15.0161V16.898H101.915V15.0161H101.394V15.0159H96.3931L96.7051 14.66C96.7256 14.6387 96.7458 14.6171 96.7654 14.5949L97.3297 13.9555L101.915 9.29973V7.54712H93.2414V8.55562Z"
                                fill="white"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_0_0"
                                    x1="82.211"
                                    y1="21.7385"
                                    x2="107.874"
                                    y2="-5.89455"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop />
                                    <stop offset="1" stopColor="#FF6102" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}
                    {stakingMode === 'ZETH' && (
                        <svg
                            width="124"
                            height="23"
                            viewBox="0 0 124 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M66.7179 4.5728L67.3246 3.96607C67.3904 3.90028 67.4685 3.84809 67.5545 3.81248C67.6405 3.77687 67.7326 3.75854 67.8256 3.75854C67.9187 3.75854 68.0108 3.77687 68.0968 3.81248C68.1827 3.84809 68.2608 3.90028 68.3266 3.96607L68.9334 4.5728C68.9992 4.6386 69.0514 4.7167 69.087 4.80266C69.1226 4.88863 69.1409 4.98076 69.1409 5.0738C69.1409 5.16685 69.1226 5.25898 69.087 5.34494C69.0514 5.43091 68.9992 5.50901 68.9334 5.57481L68.3266 6.18154C68.2608 6.24733 68.1827 6.29952 68.0968 6.33513C68.0108 6.37074 67.9187 6.38906 67.8256 6.38906C67.7326 6.38906 67.6405 6.37074 67.5545 6.33513C67.4685 6.29952 67.3904 6.24733 67.3246 6.18154L66.7179 5.57481C66.585 5.44193 66.5104 5.26172 66.5104 5.0738C66.5104 4.88589 66.585 4.70568 66.7179 4.5728ZM66.6881 17.6905V7.45201H68.9632V17.6905H66.6881Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M60.6025 7.16431C59.1631 7.16431 57.8716 7.86769 56.986 8.98319C56.5337 8.41539 55.9591 7.95696 55.305 7.64204C54.651 7.32712 53.9343 7.16382 53.2084 7.16431C52.8375 7.16409 52.4682 7.21144 52.1094 7.30519C51.7846 7.39205 51.4835 7.5509 51.2284 7.76996C50.9734 7.98902 50.7709 8.26268 50.6359 8.57065V7.44685H49.5663V7.44857H48.3737V17.687H50.6488V12.5678C50.6488 10.6832 51.7946 9.15515 53.2084 9.15515C54.6219 9.15515 55.768 10.4286 55.768 11.9993V17.687H58.0431V12.5678C58.0431 10.6832 59.1889 9.15515 60.6025 9.15515C62.0162 9.15515 63.1621 10.4286 63.1621 11.9993V17.687H65.4372V11.9993C65.4372 11.3643 65.3122 10.7356 65.0693 10.149C64.8263 9.56236 64.4702 9.02934 64.0213 8.58037C63.5723 8.13139 63.0393 7.77524 62.4527 7.53228C61.8661 7.28931 61.2374 7.16427 60.6025 7.16431Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M45.7444 7.4486V7.44687H44.6748V8.78045C44.4345 8.30528 44.0356 7.92904 43.5472 7.71681C42.6973 7.34973 41.7808 7.16167 40.855 7.16433C37.4784 7.16433 34.7408 9.58332 34.7408 12.5678C34.7408 15.5518 36.9051 17.9713 39.5756 17.9713C42.2457 17.9713 44.2875 15.807 44.2875 13.1363H42.0122C42.0122 13.8597 41.9095 14.555 41.5092 15.0569C41.2778 15.3472 40.9835 15.5811 40.6486 15.7411C40.3136 15.9011 39.9467 15.9829 39.5756 15.9805C38.1618 15.9805 37.0159 14.4524 37.0159 12.5678C37.0159 10.6833 38.7353 9.15518 40.855 9.15518C42.9754 9.15518 44.6945 10.6833 44.6945 12.5678V17.687H46.9696V7.4486H45.7444Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M29.0961 7.16445C28.1509 7.15827 27.215 7.35112 26.3492 7.73047C25.8666 7.94583 25.4752 8.32425 25.2437 8.79937V7.44699H24.1741V7.44872H22.9581V17.6872H25.2332V12.5679C25.2332 10.6834 26.9526 9.15529 29.0723 9.15529C30.4858 9.15529 31.6316 10.4287 31.6316 11.9994V17.6872H33.9067V12.014C33.9088 10.7339 33.4039 9.50503 32.5024 8.59624C31.6009 7.68744 30.3762 7.17265 29.0961 7.16445Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M19.279 7.44946V12.5687C19.279 14.4532 17.5596 15.9813 15.4402 15.9813C14.0264 15.9813 12.8806 14.7079 12.8806 13.1372V7.44946H10.6055V13.1227C10.6035 14.4027 11.1084 15.6315 12.0099 16.5403C12.9114 17.4491 14.1361 17.9639 15.4161 17.9722C16.3613 17.9784 17.2972 17.7855 18.163 17.4061C18.6459 17.1904 19.0376 16.8116 19.2693 16.3361V17.6879H21.5541V7.44946H19.279Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M0 8.55684V9.46551H6.19105L0 15.6211V17.6788H9.40386V15.6211H8.83835V15.6208H3.4169L3.75526 15.2317C3.77746 15.2083 3.79939 15.1847 3.82063 15.1604L4.43238 14.4613L9.40386 9.37047V7.4541H0V8.55684Z"
                                fill="black"
                                className="letter"
                            />
                            <path
                                d="M123.218 11.5L123.219 11.0195C123.221 7.35292 123.223 4.45673 121.847 2.59485C121.357 1.93942 120.72 1.40111 119.983 1.02153C118.913 0.438055 117.866 0.293418 116.942 0.165731L116.867 0.155845C116.023 0.0457763 115.172 -0.0064311 114.32 0.000631479H84.8988C84.047 -0.0064311 83.1958 0.0457777 82.3512 0.155843L82.2768 0.16573C81.3526 0.293416 80.3055 0.438053 79.2353 1.02152C78.4984 1.40111 77.8611 1.93941 77.3719 2.59485C75.9956 4.45673 75.9976 7.35292 76.0002 11.0195L76.0004 11.5L76.0002 11.9805C75.9976 15.6471 75.9956 18.5433 77.372 20.4051C77.8611 21.0606 78.4984 21.5989 79.2353 21.9785C80.3055 22.5619 81.3526 22.7066 82.2768 22.8343L82.3512 22.8442C83.1958 22.9542 84.047 23.0064 84.8988 22.9994H114.32C115.172 23.0064 116.023 22.9542 116.867 22.8442L116.942 22.8343C117.866 22.7066 118.913 22.5619 119.983 21.9785C120.72 21.5989 121.357 21.0606 121.847 20.4051C123.223 18.5433 123.221 15.6471 123.219 11.9805L123.218 11.5Z"
                                fill="url(#paint0_linear_0_4)"
                            />
                            <path
                                d="M82 6.54921V7.1973H88.0398L83.6241 11.5877V13.0553H91.9553V11.5877H91.552V11.5875H86.0611L86.3025 11.3099C86.3183 11.2933 86.3339 11.2765 86.3491 11.2591L86.7854 10.7605L90.3313 7.12951V5.7627H82V6.54921Z"
                                fill="url(#paint1_linear_0_5)"
                            />
                            <path
                                d="M102.836 14.5501V13.1584L102.861 9.43691H104.81V7.94259H102.871L102.891 5.01686H102.836V5.00732H100.878V7.94259H100.39V7.94347H100.389V9.41163H100.39V9.43691H100.878V14.5501C100.878 15.9015 102.193 16.9971 103.815 16.9971H105.038V15.2843H103.815C103.275 15.2843 102.836 14.9553 102.836 14.5501Z"
                                fill="white"
                            />
                            <path
                                d="M111.247 7.76292C110.382 7.76003 109.53 7.91429 108.841 8.25877C108.557 8.38495 108.106 8.76188 107.884 9.17458V5H105.861V17H107.884V12.1659C108.069 10.6705 109.495 9.50673 111.226 9.50673C112.465 9.50673 113.468 10.6221 113.468 11.998V16.9803H115.461V12.0111C115.461 9.67831 113.58 7.77081 111.247 7.76292Z"
                                fill="white"
                            />
                            <path
                                d="M94.7353 7.70068C91.8292 7.70068 89.4735 9.78242 89.4735 12.3503C89.4735 14.9183 91.8292 17 94.7353 17C96.8496 17 98.6723 15.8977 99.5081 14.3081H97.1974C96.5925 14.9091 95.7134 15.287 94.7353 15.287C93.1958 15.287 91.9024 14.3512 91.5349 13.0846H99.9311C99.9742 12.8457 99.9963 12.6003 99.9963 12.3503C99.9963 12.1003 99.9742 11.8551 99.9311 11.6163C99.533 9.39673 97.358 7.70068 94.7353 7.70068ZM94.7353 9.41369C96.265 9.41369 97.5519 10.3388 97.9279 11.5942H91.6094C91.6094 11.4424 91.6896 11.2222 91.7808 11.0365C92.3237 10.0744 93.4422 9.41369 94.7353 9.41369Z"
                                fill="white"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_0_4"
                                    x1="81.3906"
                                    y1="20.4844"
                                    x2="97.2031"
                                    y2="-1.14914e-06"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#575757" />
                                    <stop offset="1" stopColor="#878787" />
                                </linearGradient>
                                <linearGradient
                                    id="paint1_linear_0_5"
                                    x1="82.4625"
                                    y1="6.36983"
                                    x2="91.2139"
                                    y2="12.2604"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="white" />
                                    <stop
                                        offset="0.48479"
                                        stopColor="#FDFDFD"
                                        stopOpacity="0.99393"
                                    />
                                    <stop
                                        offset="0.65189"
                                        stopColor="#FCFCFC"
                                        stopOpacity="0.98669"
                                    />
                                    <stop
                                        offset="0.87254"
                                        stopColor="#595959"
                                        stopOpacity="0.41453"
                                    />
                                    <stop offset="1" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}
                </div>
            </div>
            <div className="FastDepositForm__MobileToggle">
                <svg
                    width="37"
                    height="38"
                    viewBox="0 0 37 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="FastDepositForm__MobileToggle__Icon"
                >
                    <path
                        d="M15.5741 20.8429C14.1291 19.8035 12.798 18.846 11.4669 17.8886C10.3324 17.0726 9.19815 16.2566 8.06397 15.4403C7.24073 14.8458 7.3196 13.8823 8.2317 13.4343C17.1096 9.07393 25.9881 4.71462 34.8671 0.356412C35.0415 0.270808 35.212 0.1762 35.3905 0.100563C35.9264 -0.126441 36.4588 0.0374595 36.7973 0.525649C36.9506 0.741125 37.0207 1.00499 36.9947 1.26832C36.9686 1.53165 36.8481 1.77657 36.6555 1.95767C35.7524 2.84275 34.8364 3.71464 33.9248 4.591C30.515 7.86898 27.1047 11.1464 23.6937 14.4232C23.5968 14.5053 23.4956 14.5822 23.3906 14.6537C23.5517 14.7772 23.6507 14.8574 23.754 14.9316C25.9242 16.4923 28.0952 18.0519 30.267 19.6104C30.5996 19.8486 30.8472 20.1253 30.863 20.557C30.8817 21.0662 30.6304 21.4025 30.1979 21.6377C28.8541 22.3684 27.5121 23.1024 26.1719 23.8396C18.0664 28.2724 9.96078 32.7049 1.85495 37.1371C1.72913 37.2102 1.59816 37.2741 1.46307 37.3282C1.24523 37.4095 1.0069 37.4179 0.783915 37.352C0.56093 37.286 0.365332 37.1494 0.226514 36.9625C-0.0652715 36.5703 -0.0795695 36.0621 0.209292 35.6709C0.330421 35.5188 0.463784 35.377 0.60805 35.2467C5.46236 30.5414 10.3179 25.8373 15.1747 21.1345C15.278 21.0344 15.4085 20.9624 15.5741 20.8429Z"
                        fill="url(#paint0_linear_317_13101)"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_317_13101"
                            x1="2.5"
                            y1="33"
                            x2="45"
                            y2="-11"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FFA902" />
                            <stop offset="1" stopColor="#FFCF54" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="FastDepositForm__MobileToggle__Title">
                    <ActionSelector
                        value={action}
                        actions={[
                            {
                                name: 'deposit',
                                title: 'Deposit',
                            },
                            {
                                name: 'withdraw',
                                title: 'Withdraw',
                            },
                        ]}
                        onChange={(action: string) => {
                            setAction(action);
                        }}
                    />
                </div>
            </div>
            <Input
                action="deposit"
                name={coin}
                mode={action}
                value={action === 'deposit' ? depositSum : withdrawSum}
                handler={(sum) => {
                    if (action === 'deposit') {
                        setDepositSum(sum);
                        console.log(`Deposit sum set to ${sum}`);
                    } else {
                        setWithdrawSum(sum);
                        console.log(`Withdraw sum set to ${sum}`);
                    }
                }}
                max={maxInputSum}
                onCoinChange={(coin: string) => {
                    setCoin(coin);
                    setCoinIndex(['DAI', 'USDC', 'USDT', 'BUSD', 'FRAX', 'UZD'].indexOf(coin));
                    setOptimized(false);
                }}
                chainId={chainId}
            />
            <div>
                {!account && (
                    <div className="d-flex align-items-center FastDepositForm__Actions">
                        <WalletStatus />
                        <span className="FastDepositForm__Slogan">Make your first Deposit!</span>
                    </div>
                )}
                {account && (
                    <div className="d-flex align-items-center FastDepositForm__Actions">
                        {!isETH(chainId) && (
                            <div className="text-danger">Please, switch to Ethereum network</div>
                        )}
                        {showApproveBtn && (
                            <button
                                className={`zun-button approve-usd ${
                                    !approveEnabled ? 'disabled' : ''
                                }`}
                                onClick={async () => {
                                    setPendingApproval(true);
                                    setPendingTx(true);

                                    if (!chainId) {
                                        return;
                                    }

                                    try {
                                        if (coin === 'UZD') {
                                            await onUzdApprove(coinNameToAddress(coin, chainId));
                                        } else if (coin === 'ZAPSLP') {
                                            await onLPApprove(coinNameToAddress('LP', chainId));
                                        } else if (coin === 'ZETH') {
                                            await onZethApprove(coinNameToAddress(coin, chainId));
                                        } else if (coin === 'ethZAPSLP') {
                                            await onZAPSLPApprove(coinNameToAddress(coin, chainId));
                                        }

                                        log(`${coin} approved!`);
                                    } catch (error: any) {
                                        log(`Error while approving ${coin}: ${error.message}`);
                                        setPendingApproval(false);
                                        setPendingTx(false);
                                    }

                                    setPendingApproval(false);
                                    setPendingTx(false);
                                }}
                            >
                                Approve
                            </button>
                        )}
                        {action === 'deposit' && coinApproved && isETH(chainId) && (
                            <button
                                className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                onClick={async () => {
                                    if (stakingMode === 'UZD' && !isETH(chainId)) {
                                        log('Trying to deposit UZD on non-ETH network');
                                        return false;
                                    }

                                    setPendingTx(true);

                                    try {
                                        let tx = null;
                                        tx = await onStake();

                                        log(`Deposit executed. Tx ID: ${tx.transactionHash}`);
                                        setTransactionId(tx.transactionHash);
                                        setDepositSum('0');
                                        log('Deposit success');
                                        log(JSON.stringify(tx));

                                        // @ts-ignore
                                        if (window.dataLayer) {
                                            // @ts-ignore
                                            window.dataLayer.push({
                                                event: 'deposit',
                                                userID: account,
                                                type: getActiveWalletName(),
                                                value: depositSum,
                                            });
                                        }
                                    } catch (error: any) {
                                        setPendingTx(false);
                                        setTransactionError(true);
                                        log(`❗️ Deposit error: ${error.message}`);
                                        log(JSON.stringify(error));
                                    }

                                    setPendingTx(false);
                                }}
                            >
                                Deposit
                            </button>
                        )}
                        {action === 'deposit' && coinApproved && !depositEnabled && (
                            <div className="text-muted text-danger ms-3">
                                {depositValidationError}
                            </div>
                        )}
                        {action === 'withdraw' && coinApproved && (
                            <button
                                className={`zun-button ${withdrawEnabled ? '' : 'disabled'}`}
                                onClick={async () => {
                                    setPendingTx(true);
                                    let tx = null;

                                    try {
                                        const sumToWithdraw = new BigNumber(withdrawSum)
                                            .multipliedBy(BIG_TEN.pow(UZD_DECIMALS))
                                            .toString();

                                        log(
                                            `APS contract (ETH): withdraw('${new BigNumber(
                                                withdrawSum
                                            )
                                                .multipliedBy(BIG_TEN.pow(UZD_DECIMALS))
                                                .toString()}', '${account}', '${account}'')`
                                        );

                                        if (stakingMode === 'UZD') {
                                            tx = await sushi.contracts.apsContract.methods
                                                .withdraw(sumToWithdraw, '0')
                                                .send({
                                                    from: account,
                                                });
                                        }

                                        if (stakingMode === 'ZETH') {
                                            tx = await sushi.contracts.zethApsContract.methods
                                                .withdraw(sumToWithdraw, '0')
                                                .send({
                                                    from: account,
                                                });
                                        }

                                        setTransactionId(tx.transactionHash);
                                    } catch (error: any) {
                                        setTransactionError(true);
                                        log(`❗️ Error while redeeming ZLP: ${error.message}`);
                                    }

                                    setPendingTx(false);
                                }}
                            >
                                Withdraw
                            </button>
                        )}
                        {/* {!pendingTx && (
                            <DirectAction
                                actionName="deposit"
                                checked={optimized}
                                disabled={chainId !== 1 || coinIndex === 4}
                                hint={`${
                                    chainId === 1
                                        ? 'When using optimized deposit funds will be deposited within 24 hours and many times cheaper'
                                        : 'When using deposit funds will be deposited within 24 hours, because users’ funds accumulate in one batch and distribute to the ETH network in Zunami App.'
                                }`}
                                onChange={(state: boolean) => {
                                    setOptimized(state);
                                }}
                            />
                        )} */}
                        {pendingTx && <Preloader className="ms-2" />}
                    </div>
                )}
            </div>
        </div>
    );
};
