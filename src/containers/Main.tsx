import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
// import { InfoBlock } from '../components/InfoBlock/InfoBlock';
// import { BalanceInfoBlock } from '../components/BalanceInfoBlock/BalanceInfoBlock';
// import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { getBalanceNumber } from '../utils/formatbalance';
import useLpPrice from '../hooks/useLpPrice';
import useBalanceOf from '../hooks/useBalanceOf';
import useCrossChainBalances from '../hooks/useCrossChainBalances';
import useFetch from 'react-fetch-hook';
import {
    zunamiInfoUrl,
    getHistoricalApyUrl,
    getTotalIncomeUrl,
    getActiveStratsUrl,
} from '../api/api';
import { BigNumber } from 'bignumber.js';
import usePendingOperations from '../hooks/usePendingOperations';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { Preloader } from '../components/Preloader/Preloader';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import { BscMigrationModal } from '../components/BscMigrationModal/BscMigrationModal';
import { BscMigrationModal2 } from '../components/BscMigrationModal2/BscMigrationModal2';
import useOldBscBalance from '../hooks/useOldBscBalance';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import useSupportedChain from '../hooks/useSupportedChain';
import { log, copyLogs } from '../utils/logger';
import usePausedContract from '../hooks/usePausedContract';
import { EthMergeWarningModal } from '../components/EthMergeWarningModal/EthMergeWarningModal';
import useUzdBalance from '../hooks/useUzdBalance';
import { isBSC, isETH, isPLG } from '../utils/zunami';
import { FastDepositForm } from '../components/FastDepositForm/FastDepositForm';
import Carousel from 'react-bootstrap/Carousel';
import { Pendings } from '../components/Pendings/Pendings';
// import { ServicesMenu } from '../components/ServicesMenu/ServicesMenu';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SupportersBar } from '../components/SupportersBar/SupportersBar';
import { WalletStatus } from '../components/WalletStatus/WalletStatus';
import { StakingSummary } from '../components/StakingSummary/StakingSummary';

const Header = lazy(() =>
    import('../components/Header/Header').then((module) => ({ default: module.Header }))
);

const MobileSidebar = lazy(() =>
    import('../components/SideBar/MobileSidebar/MobileSidebar').then((module) => ({
        default: module.MobileSidebar,
    }))
);

const PendingBalance = lazy(() =>
    import('../components/PendingBalance/PendingBalance').then((module) => ({
        default: module.PendingBalance,
    }))
);

const SideBar = lazy(() =>
    import('../components/SideBar/SideBar').then((module) => ({ default: module.SideBar }))
);

// const WalletStatus = lazy(() =>
//     import('../components/WalletStatus/WalletStatus').then((module) => ({
//         default: module.WalletStatus,
//     }))
// );

const ApyChart = lazy(() =>
    import('../components/ApyChart/ApyChart').then((module) => ({ default: module.ApyChart }))
);

const Chart = lazy(() =>
    import('../components/Chart/Chart').then((module) => ({ default: module.Chart }))
);

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
    apr: number;
    monthlyAvgApy: number;
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface PoolsStats {
    pools: Array<PoolInfo>;
}

interface Balance {
    chainId: String;
    value: BigNumber;
    key: string;
}

function getNetworkByKey(key: string) {
    return networks.filter((network) => network.key === key)[0];
}

function renderBalances(balances: Array<Balance>, lpPrice: BigNumber) {
    return (
        <div className="">
            <div className="mb-3">Another balances</div>
            <div className="balances">
                {balances.map((balance) => {
                    return (
                        balance.key && (
                            <div className="balance" key={balance.key}>
                                {getNetworkByKey(balance.key).icon}
                                <div className="meta">
                                    <div className="chain">
                                        {getNetworkByKey(balance.key).value}
                                    </div>
                                    <div className="sum">
                                        {`$ ${getBalanceNumber(balance.value.multipliedBy(lpPrice))
                                            .toNumber()
                                            .toLocaleString('en')}`}
                                    </div>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>
        </div>
    );
}

export const Main = (): JSX.Element => {
    useEffect(() => {
        log(`🏁 Session started ${new Date().toString()}`);
    }, []);

    const { account, connect, ethereum, chainId } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);
    const isContractPaused = usePausedContract();
    const lpPrice = useLpPrice();
    const balance = useBalanceOf();
    const oldBscBalance = useOldBscBalance();
    const balances = useCrossChainBalances(lpPrice);
    const uzdBalance = useUzdBalance();
    let activeBalance = balances[0];

    if (isBSC(chainId)) {
        activeBalance = balances[1];
    }

    if (isPLG(chainId)) {
        activeBalance = balances[2];
    }

    const userMaxWithdraw =
        lpPrice.toNumber() > 0 && balance.toNumber() !== -1
            ? lpPrice.multipliedBy(activeBalance.value)
            : new BigNumber(-1);

    const { isLoading: isZunLoading, data: zunData } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const { data: activeStratsStat } = useFetch(getActiveStratsUrl());
    const poolStats = activeStratsStat as PoolsStats;

    const poolBestAprDaily = zunamiInfo ? zunamiInfo.apr / 100 / 365 : 0;
    const poolBestAprMonthly = zunamiInfo ? (zunamiInfo.apr / 100 / 365) * 30 : 0;
    const poolBestApyYearly = zunamiInfo ? (zunamiInfo.apy / 100 / 365) * 30 * 12 : 0;
    const dailyProfit =
        userMaxWithdraw.toNumber() === -1
            ? 0
            : getBalanceNumber(userMaxWithdraw).toNumber() * poolBestAprDaily;
    const monthlyProfit =
        userMaxWithdraw.toNumber() === -1
            ? 0
            : getBalanceNumber(userMaxWithdraw).toNumber() * poolBestAprMonthly;
    const yearlyProfit =
        userMaxWithdraw.toNumber() === -1
            ? 0
            : getBalanceNumber(userMaxWithdraw).toNumber() * poolBestApyYearly;

    const [totalIncome, setTotalIncome] = useState('n/a');

    useEffect(() => {
        let activeBalance = balances[0].value;

        if (isBSC(chainId)) {
            activeBalance = balances[1].value;
        }

        if (isPLG(chainId)) {
            activeBalance = balances[2].value;
        }

        if (!account || activeBalance.toNumber() === -1 || !chainId) {
            return;
        }

        const getTotalIncome = async () => {
            let response = null;

            let totalIncomeBalance = activeBalance;

            if (totalIncomeBalance.toNumber() === 0) {
                return;
            }

            try {
                const totalIncomeUrl = getTotalIncomeUrl(
                    account,
                    totalIncomeBalance.toString(),
                    chainId
                );

                response = await fetch(totalIncomeUrl);

                const data = await response.json();
                setTotalIncome(`$${data.totalIncome}`);

                log(`Total income. Requesting (${totalIncomeUrl})`);
                log(`Total income. Value set to: ${data.totalIncome}`);
            } catch (error: any) {
                log(`❗️ Error fetching total income: ${error.message}`);
            }
        };

        getTotalIncome();
    }, [account, balances, chainId, lpPrice, uzdBalance]);

    const chartData =
        poolStats && poolStats.pools && zunamiInfo
            ? poolDataToChartData(poolStats.pools, zunamiInfo.tvl)
            : [];

    const [histApyPeriod, setHistApyPeriod] = useState('week');
    const [histApyData, setHistApyData] = useState([]);

    useEffect(() => {
        fetch(getHistoricalApyUrl(histApyPeriod))
            .then((response) => {
                return response.json();
            })
            .then((items) => {
                setHistApyData(items.data);
            });
    }, [histApyPeriod]);

    const pendingOperations = usePendingOperations();

    const pendingWithdraw =
        lpPrice.toNumber() > 0 && pendingOperations.withdraw.toNumber() !== -1
            ? lpPrice.multipliedBy(pendingOperations.withdraw)
            : new BigNumber(0);

    // const pdElement = (
    //     <div className="d-flex">
    //         <PendingBalance
    //             val={`PD: $${getBalanceNumber(
    //                 pendingOperations.deposit,
    //                 isETH(chainId) || isPLG(chainId) ? 6 : 18
    //             ).toFixed(2)}`}
    //             hint={`You have $${pendingOperations.deposit} in pending deposit`}
    //         />
    //         <PendingBalance
    //             val={`PW: $${getBalanceNumber(pendingWithdraw).toFixed(2)}`}
    //             hint={`You have $${pendingWithdraw} in pending withdraw`}
    //         />
    //     </div>
    // );

    // v1.1 migration modal
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    // v1.2 migration modal
    const [showMigrationModal2, setShowMigrationModal2] = useState(false);
    // ETH merge modal
    const [showMergeModal, setShowMergeModal] = useState(false);

    useEffect(() => {
        setShowMergeModal(isContractPaused);
    }, [isContractPaused]);

    useEffect(() => {
        if (oldBscBalance[0].toNumber() > 0) {
            setShowMigrationModal(true);
        } else {
            setShowMigrationModal(false);
        }

        if (oldBscBalance[1].toNumber() > 0) {
            log(
                `Migration from BSC gateway 1.1 to 1.2 needed. Old balance is ${oldBscBalance[1].toNumber()}`
            );
            setShowMigrationModal2(true);
        } else {
            setShowMigrationModal2(false);
        }
    }, [oldBscBalance, chainId, account]);

    const supportedChain = useSupportedChain();

    const apyHintTarget = useRef(null);
    const [showApyHint, setShowApyHint] = useState(false);
    const apyPopover = (
        <Popover
            onMouseEnter={() => setShowApyHint(true)}
            onMouseLeave={() => setShowApyHint(false)}
        >
            <Popover.Body>
                <div className="">
                    <span>Average APY in 30 days: </span>
                    <span className="text-primary">
                        {isZunLoading ? 'n/a' : `${zunamiInfo.monthlyAvgApy.toFixed(2)}%`}
                    </span>
                </div>
                <div className="">
                    <span>Average APY in 90 days: </span>
                    <span className="text-primary">
                        {isZunLoading ? 'n/a' : `${zunamiInfo.threeMonthAvgApy.toFixed(2)}%`}
                    </span>
                </div>
            </Popover.Body>
        </Popover>
    );

    const balanceTarget = useRef(null);
    const [showBalanceHint, setShowBalanceHint] = useState(false);
    const [clickCounter, setClickCounter] = useState(0);

    const balancePopover = (
        <Popover
            onMouseEnter={() => setShowBalanceHint(true)}
            onMouseLeave={() => setShowBalanceHint(false)}
        >
            <Popover.Body>{renderBalances(balances, lpPrice)}</Popover.Body>
        </Popover>
    );

    const [stakingMode, setStakingMode] = useState('UZD');

    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <React.Fragment>
                <MobileSidebar />
                <AllServicesPanel />
                {/* <ServicesMenu /> */}
                <div className="container">
                    {/* <EthMergeWarningModal show={showMergeModal} /> */}
                    {!supportedChain && (
                        <UnsupportedChain text="You're using unsupported chain. Please, switch either to Ethereum or Binance network." />
                    )}
                    <BscMigrationModal
                        show={showMigrationModal}
                        balance={oldBscBalance[0]}
                        lpPrice={lpPrice}
                        onHide={() => {
                            setShowMigrationModal(false);
                        }}
                    />
                    <BscMigrationModal2
                        show={showMigrationModal2}
                        balance={oldBscBalance[0].plus(oldBscBalance[1])}
                        lpPrice={lpPrice}
                        onHide={() => {
                            setShowMigrationModal2(false);
                        }}
                    />
                    <div className="row main-row h-100">
                        <SideBar isMainPage={true}>
                            <div className="row">
                                <div className="col sidebar-links mt-3">
                                    <button className="btn btn-secondary">
                                        <svg
                                            width="22"
                                            height="23"
                                            viewBox="0 0 22 23"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M14.6599 0.7805C13.0264 0.694891 11.6327 1.94972 11.5471 3.58324L11.3875 6.62912C11.3019 8.26264 12.5567 9.65627 14.1902 9.74188L17.2361 9.90151C18.8696 9.98712 20.2633 8.73228 20.3489 7.09876L20.5085 4.05289C20.5941 2.41937 19.3393 1.02574 17.7057 0.940127L14.6599 0.7805ZM0.155378 15.6116C0.0697685 13.978 1.3246 12.5844 2.95812 12.4988L6.00399 12.3392C7.63752 12.2536 9.03115 13.5084 9.11676 15.1419L9.27638 18.1878C9.36199 19.8213 8.10716 21.215 6.47364 21.3006L3.42777 21.4602C1.79425 21.5458 0.400614 20.291 0.315005 18.6574L0.155378 15.6116ZM13.04 13.4357C11.5486 14.1076 10.8844 15.8614 11.5563 17.3527L13.0413 20.6485C13.7133 22.1399 15.467 22.8041 16.9584 22.1322L20.2542 20.6472C21.7455 19.9752 22.4098 18.2215 21.7378 16.7301L20.2528 13.4343C19.5809 11.943 17.8271 11.2787 16.3358 11.9507L13.04 13.4357Z"
                                                fill="url(#paint0_linear_18_112668)"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_18_112668"
                                                    x1="14.254"
                                                    y1="21.9757"
                                                    x2="19.1462"
                                                    y2="12.1914"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#ADADAD" />
                                                    <stop offset="1" stopColor="#CCCCCC" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span>All Zunami’s services</span>
                                    </button>
                                    <a
                                        href="https://zunamilab.gitbook.io/product-docs/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <svg
                                            width="28"
                                            height="21"
                                            viewBox="0 0 28 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12.6032 17.5019C13.0406 17.5019 13.4342 17.8653 13.4342 18.3651C13.4342 18.8194 13.0843 19.2282 12.6032 19.2282C12.1658 19.2282 11.7721 18.8648 11.7721 18.3651C11.7721 17.8653 12.1658 17.5019 12.6032 17.5019ZM25.463 12.232C25.0256 12.232 24.6319 11.8686 24.6319 11.3688C24.6319 10.9145 24.9819 10.5056 25.463 10.5056C25.9004 10.5056 26.2941 10.8691 26.2941 11.3688C26.2941 11.8231 25.9004 12.232 25.463 12.232ZM25.463 8.73387C24.0633 8.73387 22.926 9.91506 22.926 11.3688C22.926 11.6414 22.9698 11.914 23.0573 12.1866L14.7027 16.8204C14.2216 16.0936 13.4342 15.6847 12.6032 15.6847C11.6409 15.6847 10.766 16.2753 10.3286 17.1384L2.80518 13.0497C2.01784 12.5954 1.40547 11.278 1.49295 10.0059C1.53669 9.3699 1.7554 8.87016 2.06158 8.68844C2.28029 8.55215 2.49899 8.59758 2.80518 8.73387L2.84892 8.7793C4.86101 9.86963 11.3784 13.4132 11.6409 13.5495C12.0783 13.7312 12.297 13.822 13.0406 13.4586L26.5128 6.18979C26.7315 6.09893 26.9502 5.91721 26.9502 5.5992C26.9502 5.19033 26.5565 5.0086 26.5565 5.0086C25.7692 4.64516 24.5882 4.05457 23.4509 3.50941C21.0014 2.32822 18.202 0.96532 16.9773 0.283868C15.9275 -0.306724 15.0527 0.193008 14.9214 0.283868L14.6153 0.420158C9.06014 3.32769 1.71166 7.09839 1.27425 7.37097C0.530649 7.82527 0.0494977 8.77931 0.00575671 9.96048C-0.0817253 11.8231 0.836836 13.7766 2.14907 14.4581L10.1099 18.7285C10.2849 20.0005 11.3784 21 12.6032 21C14.0029 21 15.0964 19.8642 15.1401 18.4105L23.8883 13.504C24.3258 13.8675 24.8944 14.0492 25.463 14.0492C26.8627 14.0492 28 12.868 28 11.4142C28 9.91505 26.8627 8.73387 25.463 8.73387Z"
                                                fill="#ADADAD"
                                            />
                                        </svg>
                                        <span>Docs</span>
                                    </a>
                                </div>
                            </div>
                            <div className="mobile-menu-title d-block d-lg-none">Menu</div>
                            <div
                                className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                                style={{
                                    fontSize: '13px',
                                    overflowX: 'scroll',
                                }}
                            >
                                <a
                                    href="/"
                                    className="text-center d-flex flex-column text-decoration-none selected"
                                >
                                    <img src="/dashboard.png" alt="" />
                                    <span className="text-muted mt-2">Dashboard</span>
                                </a>
                                <a
                                    href="/deposit"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/deposit.png" alt="" />
                                    <span className="text-muted mt-2">Deposit&Withdraw</span>
                                </a>
                                <a
                                    href="/uzd"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/uzd.png" alt="" />
                                    <span className="text-muted mt-2">UZD</span>
                                </a>
                                <a
                                    href="/analytics"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/analytics.png" alt="" />
                                    <span className="text-muted mt-2">Analytics</span>
                                </a>
                                <a
                                    href="https://snapshot.org/#/zunamidao.eth"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/dao.png" alt="" />
                                    <span className="text-muted mt-2">DAO</span>
                                </a>
                            </div>
                            <div className="Sidebar__Content__Data">
                                <div className="title">Your data</div>
                                <div className="values">
                                    <div
                                        className="balance"
                                        onClick={() => {
                                            setClickCounter(clickCounter + 1);

                                            if (clickCounter === 4) {
                                                copyLogs();
                                                setClickCounter(0);
                                            }
                                        }}
                                    >
                                        <div className="title d-flex gap-2 justify-content-between">
                                            <span>Balance</span>
                                            <div
                                                ref={balanceTarget}
                                                onClick={() => setShowBalanceHint(!showApyHint)}
                                                className={'hint'}
                                            >
                                                <OverlayTrigger
                                                    trigger={['hover', 'focus']}
                                                    placement="right"
                                                    overlay={balancePopover}
                                                    show={showBalanceHint}
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 13 13"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        onMouseEnter={() =>
                                                            setShowBalanceHint(true)
                                                        }
                                                        onMouseLeave={() =>
                                                            setShowBalanceHint(false)
                                                        }
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM6.23296 9.97261H4.98638L5.79002 7.12336H3.02741V5.87679H6.14162L6.94529 3.02741H8.19186L7.38819 5.87679L9.97261 5.87679V7.12336H7.03659L6.23296 9.97261Z"
                                                            fill="white"
                                                        />
                                                    </svg>
                                                </OverlayTrigger>
                                            </div>
                                        </div>
                                        <div className="value">
                                            {!account && 'n/a'}
                                            {account &&
                                                userMaxWithdraw.toNumber() !== -1 &&
                                                `$ ${getBalanceNumber(userMaxWithdraw)
                                                    .toNumber()
                                                    .toLocaleString('en')}`}
                                        </div>
                                    </div>
                                    <div className="total-income">
                                        <div className="title">Total income</div>
                                        <div className="value">
                                            {!account && 'n/a'}
                                            {account && totalIncome !== 'n/a' && totalIncome}
                                        </div>
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <div className="profits">
                                    <div className="daily">
                                        <div className="title">Daily profit</div>
                                        <div className="value vela-sans">
                                            {`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="monthly">
                                        <div className="title">Monthly profit</div>
                                        <div className="value vela-sans">
                                            {`${monthlyProfit ? monthlyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="yearly">
                                        <div className="title">Yearly profit</div>
                                        <div className="value vela-sans">
                                            {`${yearlyProfit ? yearlyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <StakingSummary
                                logo="UZD"
                                selected={stakingMode === 'UZD'}
                                baseApy="16%"
                                deposit="134,980"
                                tvl="1,394,044"
                                className="mt-3"
                                onSelect={() => {
                                    setStakingMode('UZD');
                                }}
                            />
                            <StakingSummary
                                logo="USD"
                                selected={stakingMode === 'USD'}
                                baseApy="14%"
                                deposit="2,500"
                                tvl="450,000"
                                className="mt-3"
                                onSelect={() => {
                                    setStakingMode('USD');
                                }}
                            />
                        </SideBar>
                        <div className="col content-col dashboard-col">
                            <Header section="dashboard" />
                            <div className="dashboard">
                                <div className="left-col">
                                    <div className="fast-deposit-wrapper">
                                        <FastDepositForm stakingMode={stakingMode} />
                                    </div>
                                    <div className="ApyBar">
                                        <div className="ApyBar__title">APY Bar</div>
                                        <div className="ApyBar__counters">
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title">
                                                    <span>Base APY</span>
                                                </div>
                                                <div className="ApyBar__Counter__Value ApyBar__Counter__Value--primary vela-sans">
                                                    {isZunLoading ? 'n/a' : `${zunamiInfo.apy}%`}
                                                </div>
                                            </div>
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title d-flex align-items-start gap-2">
                                                    <span>Average APY</span>
                                                    <div
                                                        ref={apyHintTarget}
                                                        onClick={() => setShowApyHint(!showApyHint)}
                                                        className={'hint'}
                                                    >
                                                        <OverlayTrigger
                                                            trigger={['hover', 'focus']}
                                                            placement="right"
                                                            overlay={apyPopover}
                                                            show={showApyHint}
                                                        >
                                                            <svg
                                                                width="13"
                                                                height="13"
                                                                viewBox="0 0 13 13"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                onMouseEnter={() =>
                                                                    setShowApyHint(true)
                                                                }
                                                                onMouseLeave={() =>
                                                                    setShowApyHint(false)
                                                                }
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM6.23296 9.97261H4.98638L5.79002 7.12336H3.02741V5.87679H6.14162L6.94529 3.02741H8.19186L7.38819 5.87679L9.97261 5.87679V7.12336H7.03659L6.23296 9.97261Z"
                                                                    fill="black"
                                                                />
                                                            </svg>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="ApyBar__Counter__Value vela-sans">
                                                    {isZunLoading
                                                        ? 'n/a'
                                                        : `${zunamiInfo.monthlyAvgApy}%`}
                                                </div>
                                            </div>
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title">
                                                    <span>Reward APY</span>
                                                </div>
                                                <div className="ApyBar__Counter__Value vela-sans">
                                                    soon
                                                </div>
                                            </div>
                                        </div>
                                        <ApyChart
                                            data={histApyData}
                                            onRangeChange={(range: string) => {
                                                setHistApyPeriod(range);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="right-col">
                                    <Carousel className="features-slider" fade indicators={false}>
                                        <Carousel.Item className="uzd">
                                            <a href="/uzd">
                                                <svg
                                                    className="uzd-logo"
                                                    width="134"
                                                    height="154"
                                                    viewBox="0 0 134 154"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M133.304 96.2632L129.728 89.5694C129.356 88.8749 128.849 88.2597 128.236 87.7589C127.623 87.2582 126.916 86.8818 126.156 86.6514C125.396 86.4174 124.597 86.3339 123.804 86.4056C123.011 86.4773 122.241 86.7029 121.537 87.0694L88.2068 104.421L72.3009 74.6446L97.2053 15.3472C97.6018 14.4109 97.744 13.3887 97.6178 12.3815C97.5784 11.508 97.3446 10.6538 96.933 9.87965L93.3577 3.18767C92.9866 2.49309 92.4801 1.87778 91.8673 1.37713C91.2545 0.876489 90.5475 0.500399 89.7869 0.270492C89.027 0.0367035 88.2276 -0.046732 87.435 0.0248464C86.6424 0.0964248 85.8722 0.321606 85.1679 0.687617L44.1891 22.0212L35.9183 6.53906C35.547 5.84456 35.0402 5.22928 34.4275 4.72852C33.8147 4.22776 33.108 3.85138 32.3475 3.62098C31.5877 3.38613 30.7884 3.30224 29.9956 3.37398C29.2028 3.44573 28.4323 3.6717 27.7285 4.039L20.9494 7.56749C20.2458 7.9342 19.6225 8.43441 19.1153 9.03945C18.608 9.64449 18.2267 10.3424 17.9933 11.0933C17.7562 11.8433 17.6713 12.6322 17.7438 13.4147C17.8163 14.1971 18.0448 14.9577 18.4159 15.6529L26.6867 31.1324L3.23025 43.3432C2.52673 43.7093 1.90329 44.2092 1.39614 44.814C0.888984 45.4188 0.508112 46.1165 0.275088 46.8671C0.0375425 47.6173 -0.0474112 48.4064 0.0251063 49.1891C0.0976239 49.9718 0.326186 50.7325 0.697645 51.4277L4.27298 58.1196C4.64401 58.8142 5.1505 59.4295 5.76331 59.9302C6.37612 60.4308 7.08316 60.8069 7.84376 61.0368C8.60359 61.2708 9.4025 61.3545 10.1951 61.2829C10.9878 61.2113 11.7585 60.9859 12.4627 60.6197L35.9164 48.4098L50.4627 75.6398L24.246 138.061C23.9022 138.919 23.7515 139.841 23.8044 140.762C23.8601 141.684 24.1183 142.583 24.5611 143.397C24.6477 143.555 24.7141 143.683 24.7824 143.815L28.5181 150.812C28.889 151.507 29.3953 152.122 30.0079 152.623C30.6206 153.123 31.3275 153.499 32.0879 153.729C32.6718 153.909 33.2797 154 33.8911 154C34.8725 153.999 35.8391 153.763 36.7078 153.312L79.9351 130.808L84.9448 140.186C85.3158 140.881 85.8223 141.496 86.4351 141.997C87.0479 142.498 87.755 142.874 88.5156 143.104C89.2754 143.338 90.0743 143.421 90.8669 143.35C91.6596 143.278 92.4303 143.053 93.1345 142.686L99.9146 139.157C100.618 138.79 101.241 138.29 101.748 137.685C102.255 137.08 102.636 136.383 102.869 135.632C103.106 134.882 103.19 134.093 103.118 133.311C103.045 132.528 102.817 131.768 102.446 131.073L97.4375 121.697L130.769 104.346C131.473 103.979 132.096 103.479 132.603 102.875C133.111 102.27 133.492 101.572 133.725 100.821C133.962 100.071 134.047 99.2828 133.975 98.5007C133.903 97.7185 133.674 96.9582 133.304 96.2632V96.2632ZM53.4188 39.2987L69.1691 31.1L60.309 52.1954L53.4188 39.2987ZM70.7054 113.532L51.8461 123.348L62.4546 98.0881L70.7054 113.532Z"
                                                        fill="url(#paint0_linear_101_731)"
                                                    />
                                                    <defs>
                                                        <linearGradient
                                                            id="paint0_linear_101_731"
                                                            x1="17.6316"
                                                            y1="8.40805"
                                                            x2="101.757"
                                                            y2="104.551"
                                                            gradientUnits="userSpaceOnUse"
                                                        >
                                                            <stop
                                                                stopColor="white"
                                                                stopOpacity="0.66"
                                                            />
                                                            <stop
                                                                offset="0.845106"
                                                                stopColor="white"
                                                                stopOpacity="0"
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="uzd">
                                                    <svg
                                                        width="98"
                                                        height="41"
                                                        viewBox="0 0 98 41"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M25.1878 10.5298V25.2697C25.1878 30.6959 20.1947 35.0957 14.04 35.0957C9.93434 35.0957 6.60696 31.4292 6.60696 26.9066V10.5298H1.74721e-05V26.8647C-0.00583848 30.5504 1.46053 34.0885 4.07846 36.7052C6.69639 39.3218 10.2528 40.8041 13.9701 40.828C16.7149 40.8458 19.4328 40.2905 21.947 39.1982C23.3574 38.5736 24.4994 37.4743 25.171 36.095V39.9968H25.1878V40.0095H31.7946V10.5298H25.1878Z"
                                                            fill="white"
                                                        />
                                                        <path
                                                            d="M90.8862 0.708008V0.709161H90.8772V14.4623C90.0829 13.0986 88.8658 12.0256 87.4069 11.4031C84.9982 10.3143 82.3858 9.73891 79.7387 9.71429C69.9347 9.71429 61.9859 16.6783 61.9859 25.2703C61.9859 33.8609 68.2701 40.8263 76.0237 40.8263C77.8673 40.8263 79.6928 40.4663 81.396 39.7668C83.0992 39.0673 84.6468 38.0421 85.9504 36.7495C87.2539 35.457 88.288 33.9225 88.9934 32.2337C89.6988 30.5449 90.0617 28.7349 90.0616 26.907H83.455C83.455 31.4289 80.128 35.0949 76.0237 35.0949C71.9187 35.0949 68.5919 30.6957 68.5919 25.2703C68.5919 19.8449 73.5841 15.4457 79.7387 15.4457C85.8955 15.4457 90.8869 19.8449 90.8869 25.2703V40.0079H97.4928V0.708008H90.8862Z"
                                                            fill="white"
                                                        />
                                                        <path
                                                            d="M34.6285 13.7046V16.3135H52.5558L34.6285 33.9865V39.8945H61.8591V33.9865H60.2215V33.9859H44.5228L45.5024 32.8686C45.5667 32.8016 45.6302 32.7338 45.6917 32.6641L47.4632 30.6568L61.8591 16.0406V10.5386H34.6285V13.7046Z"
                                                            fill="white"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="description">
                                                    The First-ever Aggregated Stablecoin
                                                </span>
                                            </a>
                                        </Carousel.Item>
                                    </Carousel>
                                    <Pendings
                                        deposit={`$${getBalanceNumber(
                                            pendingOperations.deposit,
                                            isETH(chainId) || isPLG(chainId) ? 6 : 18
                                        ).toFixed(2)}`}
                                        withdraw={`$${getBalanceNumber(pendingWithdraw).toFixed(
                                            2
                                        )}`}
                                    />
                                    <Chart data={chartData} />
                                </div>
                            </div>
                            <SupportersBar section="dashboard" />
                        </div>
                    </div>
                </div>
                <div
                    className="d-flex justify-content-center d-md-none text-center flex-column"
                    style={{ width: '100%', padding: '35px', color: '#B3B3B3' }}
                >
                    <div
                        style={{ height: '2px', backgroundColor: '#EFEFEF', margin: '20px 0' }}
                    ></div>
                    <div className="text-center">About Zunami Protocol</div>
                    <p style={{ fontSize: '14px', marginTop: '20px', color: '#B3B3B3' }}>
                        Zunami is the DAO that works with stablecoins and solves the main issues of
                        current yield-farming protocols by streamlining interaction with DeFi,
                        making it easier and cheaper while increasing profitability by
                        differentiating and rebalancing users’ funds.
                    </p>
                    <div className="d-flex gap-2 mt-3">
                        <a
                            href="https://zunamilab.gitbook.io/product-docs/"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
                            Documentation
                        </a>
                        <a
                            href="https://www.zunami.io/#faq-main"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
                            FAQ
                        </a>
                        <a
                            href="https://zunami.io"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
                            Website
                        </a>
                    </div>
                    <div
                        style={{
                            height: '2px',
                            backgroundColor: '#EFEFEF',
                            margin: '50px 0 20px 0',
                        }}
                    ></div>
                    <p style={{ color: '#B3B3B3' }}>© 2023 Zunami Protocol. Version 4.0</p>
                    <div
                        style={{
                            height: '2px',
                            backgroundColor: '#EFEFEF',
                            margin: '5px 0 20px 0',
                        }}
                    ></div>
                    <div className="text-center">
                        <svg
                            width="99"
                            height="23"
                            viewBox="0 0 99 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21.3094 11.5247L21.31 11.0796C21.312 7.68233 21.3139 4.99893 20.0776 3.27385C19.6377 2.66659 19.0653 2.16782 18.4033 1.81614C17.4417 1.27555 16.501 1.14153 15.6707 1.02323L15.6037 1.01404C14.8449 0.91209 14.0802 0.863675 13.3149 0.870213H7.99517C7.22982 0.863675 6.46512 0.91209 5.70628 1.01404L5.63936 1.02323C4.80905 1.14153 3.86829 1.27555 2.90675 1.81614C2.2447 2.16781 1.67213 2.66659 1.2326 3.27385C-0.00395362 4.99893 -0.00213667 7.68233 0.000200148 11.0796L0.000391149 11.5247L0.000200148 11.9699C-0.00213667 15.3672 -0.00395238 18.0506 1.23267 19.7756C1.67213 20.3829 2.2447 20.8816 2.90675 21.2334C3.86829 21.7739 4.80905 21.908 5.63936 22.0263L5.70628 22.0355C6.46512 22.1374 7.22982 22.1858 7.99517 22.1792H13.3149C14.0802 22.1858 14.8449 22.1374 15.6038 22.0355L15.6707 22.0263C16.501 21.908 17.4417 21.7739 18.4033 21.2334C19.0653 20.8816 19.6377 20.3829 20.0776 19.7756C21.3139 18.0506 21.312 15.3672 21.31 11.9699L21.3094 11.5247L21.3094 11.5247ZM15.406 14.3804C14.7352 15.1233 13.4997 16.0283 11.4238 16.1207C11.3185 16.1253 11.214 16.1277 11.1102 16.1277C9.49278 16.1277 8.0557 15.5609 6.93802 14.4782C6.18942 13.7531 5.61207 12.8216 5.22205 11.7097C4.83646 10.6103 4.64094 9.34876 4.64094 7.95994H7.1589C7.1589 9.05746 7.30559 10.0322 7.5949 10.857C7.85221 11.5906 8.21693 12.1894 8.67896 12.637C9.36975 13.3061 10.2561 13.6215 11.3132 13.5746C12.2875 13.5312 13.0392 13.2238 13.5474 12.6609C13.9704 12.1925 14.2034 11.5591 14.2034 10.8775C14.2092 10.4898 14.0663 10.115 13.8047 9.83187C13.6822 9.70111 13.5342 9.5975 13.3701 9.52756C13.2059 9.45761 13.0293 9.42283 12.8512 9.42548C12.6054 9.42739 12.3687 9.52052 12.1862 9.68723C12.0106 9.8537 11.8014 10.197 11.8014 10.8868H9.28342C9.28342 9.28424 9.92562 8.33869 10.4643 7.82764C11.1137 7.21846 11.9658 6.87906 12.8512 6.8769C13.3691 6.87407 13.8821 6.9783 14.3588 7.18331C14.8354 7.38826 15.2657 7.68967 15.6232 8.06892C16.3314 8.81735 16.7214 9.81478 16.7214 10.8775C16.7214 12.197 16.2542 13.441 15.406 14.3804L15.406 14.3804Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M95.6019 16.4278V6.24515H97.8645V16.4278H95.6019ZM97.4962 4.59509L97.528 4.56298C97.7712 4.31777 97.9632 4.12411 97.9968 3.91054C98.0083 3.83503 98.0023 3.75782 97.9794 3.68477C97.9482 3.57653 97.8894 3.49915 97.8375 3.43085L97.8333 3.42538C97.7855 3.3634 97.7334 3.30488 97.6773 3.25027L97.2907 2.86744C97.2356 2.81189 97.1766 2.76035 97.1141 2.71311L97.1086 2.70895C97.0398 2.65774 96.9619 2.59972 96.8533 2.56957C96.7801 2.54732 96.7028 2.54214 96.6274 2.55437C96.4141 2.58997 96.2224 2.7839 95.9795 3.02943L95.9477 3.06159L95.9159 3.09373C95.6727 3.33892 95.4806 3.53259 95.4471 3.74617C95.4356 3.82166 95.4415 3.89888 95.4645 3.97193C95.4957 4.08017 95.5545 4.15755 95.6064 4.22585L95.6106 4.23132C95.6584 4.2933 95.7105 4.35182 95.7666 4.40643L96.1532 4.78926C96.2083 4.84481 96.2673 4.89635 96.3298 4.94359L96.3353 4.94775C96.4041 4.99895 96.482 5.05698 96.5906 5.08713C96.6638 5.10937 96.7411 5.11454 96.8165 5.10234C97.0297 5.06672 97.2215 4.87278 97.4644 4.62729L97.4962 4.59509V4.59509Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M89.549 5.96539C88.1175 5.96539 86.8331 6.66495 85.9522 7.77437C85.5025 7.20967 84.9309 6.75374 84.2804 6.44053C83.63 6.12732 82.9172 5.9649 82.1952 5.96539C81.8264 5.96519 81.4591 6.01228 81.1023 6.10551C80.7791 6.19191 80.4797 6.34989 80.2259 6.56776C79.9723 6.78562 79.771 7.05778 79.6368 7.36407V6.24639H78.5729V6.24812H77.3867V16.4308H79.6495V11.3395C79.6495 9.46517 80.7891 7.9454 82.1952 7.9454C83.6011 7.9454 84.7408 9.21188 84.7408 10.774V16.4308H87.0036V11.3395C87.0036 9.46517 88.1432 7.9454 89.549 7.9454C90.955 7.9454 92.0946 9.21188 92.0946 10.774V16.4308H94.3574V10.774C94.3574 10.1426 94.2332 9.51724 93.9914 8.93382C93.7498 8.35039 93.3957 7.82028 92.9492 7.37374C92.5026 6.92722 91.9726 6.57301 91.3892 6.33136C90.8058 6.08971 90.1804 5.96536 89.549 5.96539Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M74.7679 6.24814V6.24642H73.704V7.57274C73.4649 7.10015 73.0682 6.72596 72.5825 6.51488C71.7372 6.1498 70.8257 5.96277 69.9049 5.96542C66.5469 5.96542 63.8242 8.37124 63.8242 11.3395C63.8242 14.3072 65.9767 16.7135 68.6326 16.7135C71.2881 16.7135 73.3188 14.561 73.3188 11.9049H71.0558C71.0558 12.6243 70.9538 13.3158 70.5557 13.815C70.3255 14.1037 70.0328 14.3363 69.6997 14.4955C69.3667 14.6546 69.0017 14.736 68.6326 14.7335C67.2264 14.7335 66.0868 13.2138 66.0868 11.3395C66.0868 9.46518 67.7969 7.94541 69.9049 7.94541C72.014 7.94541 73.7236 9.46519 73.7236 11.3395V16.4308H75.9863V6.24814H74.7679Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M58.2256 5.96554C57.2856 5.95939 56.3548 6.15118 55.4937 6.52847C55.0137 6.74265 54.6244 7.11902 54.3942 7.59154V6.24654H53.3304V6.24824H52.1211V16.4309H54.3839V11.3396C54.3839 9.46531 56.0938 7.94553 58.202 7.94553C59.6078 7.94553 60.7474 9.212 60.7474 10.7742V16.4309H63.01V10.7886C63.0122 9.51551 62.5101 8.29336 61.6135 7.38952C60.7168 6.48567 59.4987 5.97368 58.2256 5.96554Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M48.4505 6.24811V11.3395C48.4505 13.2137 46.7405 14.7335 44.6326 14.7335C43.2265 14.7335 42.0869 13.467 42.0869 11.9049V6.24811H39.8242V11.8904C39.8222 13.1635 40.3244 14.3856 41.221 15.2894C42.1176 16.1933 43.3356 16.7053 44.6087 16.7135C45.5487 16.7197 46.4795 16.5278 47.3406 16.1506C47.8209 15.936 48.2104 15.5592 48.4408 15.0863V16.4308H50.7132V6.24811H48.4505Z"
                                fill="#B3B3B3"
                            />
                            <path
                                d="M29.2773 7.34679V8.25051H35.4347L29.2773 14.3725V16.4191H38.63V14.3725H38.0676V14.3723H32.5861L32.9226 13.9853C32.9447 13.9621 32.9665 13.9386 32.9876 13.9144L33.6856 13.2191L38.63 8.15598V6.25006H29.2773V7.34679Z"
                                fill="#B3B3B3"
                            />
                        </svg>
                    </div>
                </div>
            </React.Fragment>
        </Suspense>
    );
};
