import './FastDepositForm.scss';
import { useState, useMemo, useEffect } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { DirectAction } from '../Form/DirectAction/DirectAction';
import { useAllowanceStables } from '../../hooks/useAllowance';
import useApprove from '../../hooks/useApprove';
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
} from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { Link } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import { log } from '../../utils/logger';
import { isBSC, isETH, isPLG } from '../../utils/zunami';
import { ActionSelector } from '../Form/ActionSelector/ActionSelector';
import useApproveUzd from '../../hooks/useApproveUzd';
import { contractAddresses } from '../../sushi/lib/constants';
import useZapsLpBalance from '../../hooks/useZapsLpBalance';
import BigNumber from 'bignumber.js';

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
    const [coin, setCoin] = useState(stakingMode === 'UZD' ? 'UZD' : 'USDC');
    const [depositSum, setDepositSum] = useState('');
    const [withdrawSum, setWithdrawSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [coinIndex, setCoinIndex] = useState(-1);
    const approveList = useAllowanceStables();
    const apsBalance = useZapsLpBalance();
    const approvedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
        approveList ? approveList[3].toNumber() > 0 : false,
        approveList ? approveList[4].toNumber() > 0 : false,
        approveList ? approveList[5].toNumber() > 0 : false,
    ];

    const coins = useMemo(() => {
        return ['DAI', 'USDC', 'USDT', 'BUSD', 'FRAX', 'UZD'];
    }, []);

    const { onApprove } = useApprove();
    const { onUzdApprove } = useApproveUzd();
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
        ],
        !optimized
    );

    useEffect(() => {
        if (coinIndex === -1) {
            const preselectedCoin = 'USDT';
            setCoin(preselectedCoin);
            setCoinIndex(coins.indexOf(preselectedCoin));
            console.log(`Set to ${preselectedCoin}`);
        }

        if (chainId === 56 && coinIndex !== 3) {
            setCoin('USDT');
            setCoinIndex(coins.indexOf(coin));
        }

        if (isPLG(chainId) && coinIndex !== 3) {
            setCoin('USDT');
            setCoinIndex(coins.indexOf(coin));
        }
    }, [chainId, coin, coinIndex, coins]);

    useEffect(() => {
        const preselectedCoin = stakingMode === 'UZD' ? 'UZD' : 'USDT';
        setCoin(preselectedCoin);
        setCoinIndex(coins.indexOf(preselectedCoin));

        if (preselectedCoin === 'UZD') {
            setOptimized(false);
        }
    }, [stakingMode, coins]);

    // get user max balance
    const fullBalance = useMemo(() => {
        if (isBSC(chainId)) {
            return getFullDisplayBalance(userBalanceList[coinIndex], 18);
        } else if (isETH(chainId)) {
            const isDaiOrFrax = ['DAI', 'FRAX'].indexOf(coin) !== -1;

            if (coin === 'UZD') {
                return getFullDisplayBalance(userBalanceList[coinIndex], 18);
            }

            return getFullDisplayBalance(userBalanceList[coinIndex], isDaiOrFrax ? 18 : 6);
        } else if (isPLG(chainId)) {
            return getFullDisplayBalance(userBalanceList[coinIndex], coin === 'DAI' ? 18 : 6);
        }
    }, [userBalanceList, coin, coinIndex, chainId]);

    const depositEnabled =
        approvedTokens[coinIndex] &&
        Number(depositSum) > 0 &&
        !pendingApproval &&
        Number(depositSum) <= Number(fullBalance);

    // set default input to max
    useEffect(() => {
        if (!fullBalance) {
            return;
        }

        setDepositSum(fullBalance.toString());
    }, [fullBalance]);

    const [action, setAction] = useState('deposit');

    useEffect(() => {
        if (action === 'withdraw' && withdrawSum === '') {
            setWithdrawSum(getFullDisplayBalance(apsBalance, 18));
        }
    }, [action, apsBalance, withdrawSum]);

    return (
        <div className={`FastDepositForm ${className}`}>
            {renderToasts(
                transactionError,
                setTransactionError,
                chainId,
                transactionId,
                setTransactionId
            )}
            <div className="d-flex justify-content-between align-items-center">
                <span className="FastDepositForm__Title">
                    {stakingMode === 'USD' && (
                        <svg
                            width="37"
                            height="38"
                            viewBox="0 0 37 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15.5741 20.8429C14.1291 19.8035 12.798 18.846 11.4669 17.8886C10.3324 17.0726 9.19815 16.2566 8.06397 15.4403C7.24073 14.8458 7.3196 13.8823 8.2317 13.4343C17.1096 9.07393 25.9881 4.71462 34.8671 0.356412C35.0415 0.270808 35.212 0.1762 35.3905 0.100563C35.9264 -0.126441 36.4588 0.0374595 36.7973 0.525649C36.9506 0.741125 37.0207 1.00499 36.9947 1.26832C36.9686 1.53165 36.8481 1.77657 36.6555 1.95767C35.7524 2.84275 34.8364 3.71464 33.9248 4.591C30.515 7.86898 27.1047 11.1464 23.6937 14.4232C23.5968 14.5053 23.4956 14.5822 23.3906 14.6537C23.5517 14.7772 23.6507 14.8574 23.754 14.9316C25.9242 16.4923 28.0952 18.0519 30.267 19.6104C30.5996 19.8486 30.8472 20.1253 30.863 20.557C30.8817 21.0662 30.6304 21.4025 30.1979 21.6377C28.8541 22.3684 27.5121 23.1024 26.1719 23.8396C18.0664 28.2724 9.96078 32.7049 1.85495 37.1371C1.72913 37.2102 1.59816 37.2741 1.46307 37.3282C1.24523 37.4095 1.0069 37.4179 0.783915 37.352C0.56093 37.286 0.365332 37.1494 0.226514 36.9625C-0.0652715 36.5703 -0.0795695 36.0621 0.209292 35.6709C0.330421 35.5188 0.463784 35.377 0.60805 35.2467C5.46236 30.5414 10.3179 25.8373 15.1747 21.1345C15.278 21.0344 15.4085 20.9624 15.5741 20.8429Z"
                                fill="url(#paint0_linear_101_847)"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_101_847"
                                    x1="2.5"
                                    y1="33"
                                    x2="45"
                                    y2="-11"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#E2E2E2" />
                                    <stop offset="1" stopColor="#ECECEC" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}
                    {stakingMode === 'USD' && <span>Fast deposit</span>}
                    {stakingMode === 'UZD' && (
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
                    )}
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
                    {stakingMode === 'USD' && (
                        <svg
                            width="122"
                            height="25"
                            viewBox="0 0 122 25"
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
                                d="M121.999 12.0243L122 11.5219C122.002 7.68815 122.004 4.65992 120.566 2.71316C120.054 2.02784 119.388 1.46499 118.617 1.0681C117.498 0.458027 116.403 0.306795 115.437 0.173287L115.359 0.16295C114.476 0.0478633 113.586 -0.00672431 112.695 0.000660269H85.4619C84.5712 -0.00672431 83.6813 0.0478648 82.7981 0.162948L82.7203 0.173286C81.754 0.306794 80.6592 0.458025 79.5401 1.0681C78.7697 1.46499 78.1033 2.02784 77.5918 2.71316C76.1527 4.65992 76.1549 7.68815 76.1576 11.5219L76.1578 12.0243L76.1576 12.5267C76.1549 16.3605 76.1527 19.3887 77.5919 21.3355C78.1033 22.0208 78.7697 22.5836 79.5401 22.9805C80.6592 23.5906 81.754 23.7418 82.7203 23.8753L82.7981 23.8857C83.6813 24.0007 84.5712 24.0553 85.4619 24.048H112.695C113.586 24.0553 114.476 24.0007 115.359 23.8857L115.437 23.8753C116.403 23.7418 117.498 23.5906 118.617 22.9805C119.388 22.5836 120.054 22.0208 120.566 21.3355C122.004 19.3887 122.002 16.3605 122 12.5267L121.999 12.0243Z"
                                fill="url(#paint0_linear_3_98048)"
                            />
                            <path
                                d="M102.146 12.6543C101.299 12.1179 100.147 12.0463 98.8442 11.7855C97.5739 11.5316 96.4986 11.3187 96.4986 10.7432C96.4986 10.1677 97.5489 9.70067 98.8442 9.70067C100.14 9.70067 101.19 10.1677 101.19 10.7432H103.274C103.274 9.16014 101.291 7.87646 98.8442 7.87646C96.3973 7.87646 94.4139 9.16014 94.4139 10.7432C94.4139 11.477 94.8406 12.1469 95.5417 12.6543C96.3529 13.2408 97.557 13.3524 98.8442 13.6099C100.147 13.8705 101.45 14.1352 101.45 14.7823C101.45 15.4298 100.283 15.9553 98.8442 15.9553C97.4049 15.9553 96.2381 15.4298 96.2381 14.7823C96.2381 14.7385 96.2437 14.6953 96.2541 14.6522H94.1582C94.1546 14.6953 94.1533 14.7385 94.1533 14.7823C94.1533 16.4375 96.2533 17.7795 98.8442 17.7795C101.435 17.7795 103.535 16.4375 103.535 14.7823C103.535 13.9502 103.004 13.197 102.146 12.6543Z"
                                fill="white"
                            />
                            <path
                                d="M91.1946 12.8222C91.1946 14.55 89.6047 15.9511 87.6449 15.9511C86.3375 15.9511 85.278 14.7835 85.278 13.3434V8.12866H83.1742V13.3301C83.1723 14.5037 83.6393 15.6303 84.4729 16.4635C85.3065 17.2967 86.4389 17.7687 87.6226 17.7763C88.4966 17.782 89.3621 17.6052 90.1626 17.2574C90.6052 17.0433 90.9751 16.7319 91.1893 16.2692V17.5117H91.1946V17.5157H93.2984V8.12866H91.1946V12.8222Z"
                                fill="white"
                            />
                            <path
                                d="M113.139 5.00781V5.00818H113.136V9.38751C112.883 8.95327 112.496 8.61162 112.031 8.4134C111.264 8.06668 110.432 7.88347 109.589 7.87563C106.467 7.87563 103.936 10.0931 103.936 12.829C103.936 15.5645 105.937 17.7824 108.406 17.7824C108.993 17.7825 109.575 17.6678 110.117 17.4451C110.66 17.2223 111.152 16.8959 111.567 16.4843C111.982 16.0727 112.311 15.5841 112.536 15.0464C112.761 14.5086 112.876 13.9322 112.876 13.3502H110.773C110.773 14.7901 109.713 15.9574 108.406 15.9574C107.099 15.9574 106.04 14.5566 106.04 12.829C106.04 11.1014 107.63 9.70062 109.589 9.70062C111.55 9.70062 113.139 11.1015 113.139 12.829V17.5219H115.243V5.00781H113.139Z"
                                fill="white"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_3_98048"
                                    x1="81.7937"
                                    y1="21.4183"
                                    x2="98.3272"
                                    y2="1.19994e-06"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#FE9604" />
                                    <stop offset="1" stopColor="#FE9F04" />
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
                    {stakingMode === 'USD' ? 'Fast Deposit' : ''}
                    {stakingMode === 'UZD' && <div className="">QWE</div>}
                </div>
            </div>
            <Input
                action="deposit"
                name={coin}
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
                max={userBalanceList[coinIndex]}
                onCoinChange={(coin: string) => {
                    setCoin(coin);
                    setCoinIndex(['DAI', 'USDC', 'USDT', 'BUSD', 'FRAX', 'UZD'].indexOf(coin));

                    // if (coin === 'FRAX') {
                    setOptimized(false);
                    // } else {
                    // setOptimized(true);
                    // }
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
                        {!approvedTokens[coinIndex] && (
                            <button
                                className="zun-button approve-usd"
                                onClick={async () => {
                                    setPendingApproval(true);
                                    setPendingTx(true);

                                    if (!chainId) {
                                        return;
                                    }

                                    try {
                                        if (coin !== 'UZD') {
                                            await onApprove(coinNameToAddress(coin, chainId));
                                            log(`${coin} approved!`);
                                        } else {
                                            await onUzdApprove(coinNameToAddress(coin, chainId));
                                            log(`${coin} approved!`);
                                        }
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
                        {approvedTokens[coinIndex] && action === 'deposit' && (
                            <button
                                className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                onClick={async () => {
                                    setPendingTx(true);

                                    try {
                                        let tx = null;

                                        if (coin === 'UZD') {
                                            tx = await onStake();
                                        } else {
                                            tx = await onStake();
                                        }

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
                        {stakingMode === 'UZD' && action === 'withdraw' && (
                            <button
                                className={`zun-button`}
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

                                        tx = await sushi.contracts.apsContract.methods
                                            .withdraw(sumToWithdraw, '0')
                                            .send({
                                                from: account,
                                            });

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
