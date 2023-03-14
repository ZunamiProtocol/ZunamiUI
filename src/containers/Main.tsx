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
                            <Pendings
                                deposit={`$${getBalanceNumber(
                                    pendingOperations.deposit,
                                    isETH(chainId) || isPLG(chainId) ? 6 : 18
                                ).toFixed(2)}`}
                                withdraw={`$${getBalanceNumber(pendingWithdraw).toFixed(2)}`}
                            />
                        </SideBar>
                        <div className="col content-col dashboard-col">
                            <Header section="dashboard" />
                            <div className="dashboard">
                                <div className="fast-deposit-wrapper">
                                    <FastDepositForm />
                                </div>
                                <Carousel className="features-slider" fade indicators>
                                    <Carousel.Item className="uzd">
                                        <span className="title">Zunami Universe</span>
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
                                                    <stop stopColor="white" stopOpacity="0.66" />
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
                                                width="45"
                                                height="43"
                                                viewBox="0 0 45 43"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M35.1356 0.702759V21.2641C35.1356 28.8334 28.1706 34.971 19.585 34.971C13.8579 34.971 9.21636 29.8563 9.21636 23.5475V0.702759H2.43726e-05V23.4891C-0.00814437 28.6305 2.03736 33.5659 5.68923 37.216C9.3411 40.8661 14.3022 42.9339 19.4875 42.9671C23.3164 42.9919 27.1078 42.2174 30.6148 40.6937C32.5823 39.8223 34.1754 38.2889 35.1122 36.3648V41.8076H35.1356V41.8254H44.3518V0.702759H35.1356Z"
                                                    fill="white"
                                                />
                                            </svg>
                                            <svg
                                                style={{ marginLeft: '3px' }}
                                                width="39"
                                                height="42"
                                                viewBox="0 0 39 42"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M0.303711 5.12901V8.76819H25.3113L0.303711 33.4211V41.6625H38.2889V33.4211H36.0046V33.4203H14.1057L15.4723 31.8617C15.562 31.7682 15.6506 31.6737 15.7364 31.5764L18.2075 28.7763L38.2889 8.38762V0.712524H0.303711V5.12901Z"
                                                    fill="white"
                                                />
                                            </svg>
                                            <svg
                                                width="50"
                                                height="56"
                                                viewBox="0 0 50 56"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M40.7846 0V0.00160823H40.772V19.1865C39.6641 17.2842 37.9662 15.7875 35.9311 14.9191C32.5711 13.4002 28.927 12.5976 25.2344 12.5633C11.5584 12.5633 0.470215 22.2777 0.470215 34.2631C0.470215 46.2465 9.23633 55.9629 20.0522 55.9629C22.6239 55.9629 25.1704 55.4608 27.5463 54.485C29.9222 53.5092 32.081 52.079 33.8994 50.276C35.7177 48.4729 37.1602 46.3324 38.1442 43.9766C39.1282 41.6209 39.6345 39.096 39.6343 36.5462H30.4184C30.4184 42.854 25.7775 47.9679 20.0522 47.9679C14.326 47.9679 9.68517 41.8313 9.68517 34.2631C9.68517 26.6949 16.6491 20.5583 25.2344 20.5583C33.8228 20.5583 40.7856 26.6949 40.7856 34.2631V54.8213H50.0005V0H40.7846Z"
                                                    fill="white"
                                                />
                                            </svg>
                                        </div>
                                        <span className="description">
                                            The first high-profitable stablecoin
                                        </span>
                                    </Carousel.Item>
                                    <Carousel.Item className="yeld">
                                        <span className="title">Zunami Universe</span>
                                        <svg
                                            width="236"
                                            height="127"
                                            viewBox="0 0 236 127"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="logo"
                                        >
                                            <rect
                                                x="236"
                                                y="64.4968"
                                                width="61.5653"
                                                height="126.062"
                                                rx="30.7826"
                                                transform="rotate(90 236 64.4968)"
                                                fill="url(#paint0_linear_504_636)"
                                            />
                                            <path
                                                d="M87.4512 82.4904C85.7109 82.4904 84.0659 82.8487 82.6033 83.4852C81.6936 83.881 80.9585 84.591 80.5324 85.484V83.4057C80.5343 83.355 80.5364 83.3042 80.5364 83.2533V83.0025H80.5324V83.0007H77.898V83.0025H76.4385V101.444H80.5364V92.2232C80.5364 88.8287 83.6332 86.0761 87.4512 86.0761C89.9974 86.0761 92.0614 88.3697 92.0614 91.1988H96.1594C96.1594 86.389 92.2607 82.4904 87.4512 82.4904V82.4904Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M107.753 82.4904C101.67 82.4904 96.7388 86.8479 96.7388 92.2232C96.7388 97.5985 101.67 101.956 107.753 101.956C112.179 101.956 115.994 99.6488 117.744 96.3212H112.907C111.64 97.5793 109.8 98.3703 107.753 98.3703C104.53 98.3703 101.823 96.4114 101.054 93.7602H118.629C118.719 93.2602 118.765 92.7465 118.765 92.2232C118.765 91.6999 118.719 91.1866 118.629 90.6866C117.796 86.0406 113.243 82.4904 107.753 82.4904V82.4904ZM107.753 86.0761C110.955 86.0761 113.649 88.0126 114.436 90.6404H101.21C101.21 90.3226 101.378 89.8616 101.568 89.4731C102.705 87.4591 105.046 86.0761 107.753 86.0761Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M172.423 96.8328V93.9193L172.475 86.1284H176.555V83.0001H172.496L172.537 76.8752H172.423V76.8552H168.325V83.0001H167.302V83.002H167.301V86.0755H167.302V86.1284H168.325V96.8328C168.325 99.6619 171.078 101.955 174.472 101.955H177.034V98.3697H174.472C173.341 98.3697 172.423 97.6811 172.423 96.8328Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M187.856 82.4904C181.773 82.4904 176.842 86.8479 176.842 92.2232C176.842 97.5985 181.773 101.956 187.856 101.956C193.938 101.956 198.869 97.5985 198.869 92.2232C198.869 86.848 193.938 82.4904 187.856 82.4904ZM187.856 98.3703C184.036 98.3703 180.94 95.6181 180.94 92.2232C180.94 88.8283 184.036 86.0761 187.856 86.0761C191.675 86.0761 194.771 88.8283 194.771 92.2232C194.771 95.6182 191.675 98.3703 187.856 98.3703Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M211.594 82.4904C209.854 82.4904 208.209 82.8487 206.746 83.4852C205.881 83.8616 205.174 84.5224 204.74 85.3545V83.0007H202.106V83.0025H200.582V101.444H204.679V92.2232C204.679 88.8287 207.776 86.0761 211.594 86.0761C214.141 86.0761 216.204 88.3697 216.204 91.1988H220.302C220.302 86.389 216.404 82.4904 211.594 82.4904V82.4904Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M24.9456 83.0007H22.3112V85.4435C21.8824 84.5693 21.1555 83.8753 20.2597 83.4855C18.7966 82.8491 17.1513 82.4904 15.4102 82.4904C9.32856 82.4904 4.39746 86.8479 4.39746 92.2232C4.39746 97.5985 8.29605 101.956 13.1059 101.956C17.9153 101.956 21.814 98.0574 21.814 93.2476H17.716C17.716 96.0767 15.6521 98.3703 13.1059 98.3703C10.5594 98.3703 8.49534 95.6177 8.49534 92.2232C8.49534 88.8287 11.5922 86.0761 15.4102 86.0761C19.2297 86.0761 22.3262 88.8287 22.3262 92.2232V101.444H26.4241V83.0025H24.9456V83.0007Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M48.7248 83.0013H46.0904V85.4366C45.661 84.5659 44.9357 83.8748 44.0424 83.4861C42.5794 82.8497 40.9341 82.4913 39.1929 82.4913C33.1113 82.4913 28.1802 86.8489 28.1802 92.2238C28.1802 97.5991 32.0788 101.957 36.8886 101.957C41.698 101.957 45.5967 98.0581 45.5967 93.2486H41.4988C41.4988 96.0773 39.4348 98.3709 36.8886 98.3709C34.3421 98.3709 32.2781 95.6184 32.2781 92.2238C32.2781 88.8296 35.3749 86.0771 39.1929 86.0771C43.0124 86.0771 46.1089 88.8296 46.1089 92.2238V98.3709C46.1089 101.765 43.0124 104.518 39.1944 104.518H32.7903V108.104H39.1944C45.2757 108.104 50.2068 103.746 50.2068 98.3709V83.0032H48.7248V83.0013Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M72.4313 83.0013H69.797V85.3722C69.364 84.5319 68.6528 83.8652 67.7816 83.4861C66.3186 82.8497 64.6733 82.4913 62.9322 82.4913C56.8505 82.4913 51.9194 86.8489 51.9194 92.2238C51.9194 97.5991 55.818 101.957 60.6278 101.957C65.4373 101.957 69.336 98.0581 69.336 93.2486H65.238C65.238 96.0773 63.1741 98.3709 60.6278 98.3709C58.0813 98.3709 56.0173 95.6184 56.0173 92.2238C56.0173 88.8296 59.1142 86.0771 62.9322 86.0771C66.7517 86.0771 69.8482 88.8296 69.8482 92.2238V98.3709C69.8482 101.765 66.7517 104.518 62.9337 104.518H56.5295V108.104H62.9337C69.015 108.104 73.9461 103.746 73.9461 98.3709V83.0032H72.4313V83.0013Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M140.198 83.0013H137.564V85.4092C137.133 84.5513 136.413 83.8708 135.529 83.4861C134.066 82.8497 132.42 82.4913 130.679 82.4913C124.598 82.4913 119.667 86.8489 119.667 92.2238C119.667 97.5991 123.565 101.957 128.375 101.957C133.184 101.957 137.083 98.0581 137.083 93.2486H132.985C132.985 96.0773 130.921 98.3709 128.375 98.3709C125.828 98.3709 123.764 95.6184 123.764 92.2238C123.764 88.8296 126.861 86.0771 130.679 86.0771C134.499 86.0771 137.595 88.8296 137.595 92.2238V98.3709C137.595 101.765 134.499 104.518 130.681 104.518H124.277V108.104H130.681C136.762 108.104 141.693 103.746 141.693 98.3709V83.0032H140.198V83.0013Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M163.909 83.0007H161.274V85.3471C160.84 84.5184 160.134 83.8609 159.272 83.4855C157.809 82.8491 156.164 82.4904 154.422 82.4904C148.341 82.4904 143.41 86.8479 143.41 92.2232C143.41 97.5985 147.308 101.956 152.118 101.956C156.928 101.956 160.826 98.0574 160.826 93.2476H156.728C156.728 96.0767 154.664 98.3703 152.118 98.3703C149.572 98.3703 147.508 95.6177 147.508 92.2232C147.508 88.8287 150.604 86.0761 154.422 86.0761C158.242 86.0761 161.338 88.8287 161.338 92.2232V101.444H165.436V83.0025H163.909V83.0007Z"
                                                fill="white"
                                            />
                                            <rect
                                                y="61.5652"
                                                width="61.5652"
                                                height="99.6771"
                                                rx="30.7826"
                                                transform="rotate(-90 0 61.5652)"
                                                fill="url(#paint1_linear_504_636)"
                                            />
                                            <path
                                                d="M56.8626 17.0583L42.8114 45.2794L40.8359 49.1306L38.5737 44.6399L24.8402 17.0583H16.1235L36.4935 57.9688L31.8916 67.2109L38.8764 70.6884L65.5799 17.0583H56.8626Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M105.129 16.0244C91.8915 16.0244 81.1606 25.5072 81.1606 37.2047C81.1606 48.9023 91.8915 58.385 105.129 58.385C114.76 58.385 123.063 53.364 126.871 46.1225H116.345C113.589 48.8604 109.585 50.5819 105.129 50.5819C98.1164 50.5819 92.2248 46.3189 90.5508 40.5494H128.797C128.994 39.4613 129.094 38.3435 129.094 37.2047C129.094 36.0659 128.994 34.9489 128.797 33.8609C126.984 23.7504 117.076 16.0244 105.129 16.0244ZM105.129 23.8276C112.125 23.8276 118.008 28.075 119.695 33.8283H90.8907C90.8907 32.9684 91.2131 32.0655 91.6645 31.2271C94.1356 26.84 99.2353 23.8276 105.129 23.8276Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M141.427 47.2366V3.76221H132.509V47.2366C132.509 53.3932 138.499 58.3845 145.886 58.3845H151.46V50.5813H145.886C143.425 50.5813 141.427 49.0828 141.427 47.2366Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M190.41 3.73486V22.4613C189.477 20.5538 187.893 19.0395 185.941 18.1897C182.757 16.8047 179.176 16.024 175.387 16.024C162.153 16.024 151.422 25.5068 151.422 37.2043C151.422 48.9018 159.906 58.3846 170.373 58.3846C180.839 58.3846 189.323 49.9006 189.323 39.4336H180.405C180.405 45.5902 175.914 50.5814 170.373 50.5814C164.831 50.5814 160.34 44.5914 160.34 37.2043C160.34 29.8172 167.079 23.8272 175.387 23.8272C183.397 23.8272 189.944 29.3894 190.41 36.4039V57.3092H199.356V3.73486H190.41Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M68.4253 14.8944V5.97681H77.343V14.8944H68.4253ZM68.4253 57.2541V17.1244H77.343V57.2541H68.4253Z"
                                                fill="white"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_504_636"
                                                    x1="269.669"
                                                    y1="59.7217"
                                                    x2="296.282"
                                                    y2="176.065"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="paint1_linear_504_636"
                                                    x1="5.79079"
                                                    y1="61.9162"
                                                    x2="73.1563"
                                                    y2="147.438"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </Carousel.Item>
                                    <Carousel.Item className="curve">
                                        <span className="title">Zunami Universe</span>
                                        <svg
                                            width="148"
                                            height="86"
                                            viewBox="0 0 148 86"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="logo"
                                        >
                                            <path
                                                opacity="0.43"
                                                d="M79.6389 5.67801C79.6389 5.67801 70.3336 2.11173 57.2851 0.236584C56.4069 0.110398 54.9746 0 53.1134 0C53.1134 0 49.1727 0.15907 45.3998 1.73495C40.8177 3.6488 35.5698 9.94365 32.3338 18.6901C27.7043 31.2035 29.4992 42.5009 30.917 50.7867C31.9045 56.5573 33.928 64.8624 38.4733 74.2873C39.7966 76.4246 42.2592 80.0573 45.3998 82.7255C46.1926 83.399 46.9806 83.9704 47.9972 84.4604C50.5417 85.6869 52.8586 85.604 53.507 85.5645C53.9638 85.5366 56.1531 85.3741 58.5445 83.9873C60.8823 82.6314 62.0706 80.8841 63.6607 78.5458C64.2312 77.7068 65.7231 75.4105 66.8878 72.0792C67.4502 70.4706 67.7839 69.0566 67.9897 67.9784C69.6339 67.3688 71.7999 66.5974 74.3653 65.7703C76.2469 65.1637 79.4432 64.1727 83.6532 63.089C91.9299 60.9585 92.9685 61.3417 98.2933 59.7769C100.56 59.1107 104.005 57.9734 108.132 56.0704C108.706 55.7386 109.527 55.1898 110.336 54.3354C111.055 53.576 112.011 52.3138 113.012 48.9729C113.543 47.204 114.235 44.8363 114.35 41.5599C114.381 40.6998 114.46 37.2642 113.248 32.964C112.792 31.3425 112.019 28.6799 110.1 25.7088C108.301 22.9247 106.39 21.2536 104.511 19.6365C101.259 16.8358 98.36 15.15 96.0894 13.8796C88.9156 9.86563 85.3287 7.85864 79.6389 5.67801Z"
                                                fill="url(#paint0_linear_399_5255)"
                                            />
                                            <path
                                                opacity="0.31"
                                                d="M65.7657 55.6034C65.1936 49.1223 62.5399 44.6668 60.8257 42.3033C58.8038 39.5157 56.689 36.5999 52.869 35.8541C48.4305 34.9876 44.4712 37.5937 43.64 38.1408C35.2451 43.6664 36.985 55.5727 37.6584 60.1807C38.9585 69.0774 43.2159 73.1931 44.426 74.2888C46.0112 75.7242 48.1621 77.6197 51.401 77.9952C57.6059 78.7144 62.3074 73.2179 62.8639 72.5475C64.9782 70.0006 65.4631 67.4747 65.9318 65.0339C66.6904 61.083 66.2439 57.7449 65.7657 55.6034Z"
                                                fill="url(#paint1_linear_399_5255)"
                                            />
                                            <path
                                                opacity="0.29"
                                                d="M72.0718 39.7521C66.9891 40.081 62.4663 36.6419 61.5356 31.7443C61.4154 31.1113 61.2943 30.5076 61.1742 29.9344C60.6698 27.5255 59.9751 24.2618 58.5544 20.0961C57.9739 18.3941 57.3993 16.914 56.8981 15.7035C56.5093 14.7646 56.7786 13.6752 57.5879 13.043C57.5956 13.0369 57.6034 13.0309 57.6112 13.0249C57.9901 12.7345 58.3531 12.5906 58.5544 12.5125C59.2947 12.2251 59.9432 12.2072 60.2311 12.205C64.5106 12.1722 66.9378 12.7174 66.9378 12.7174C70.5686 13.367 71.5769 13.4822 75.3212 14.4596C77.9134 15.1363 82.0445 16.2301 87.2676 18.3539C89.198 19.1389 93.1255 20.8159 97.4325 23.478C99.0392 24.4711 100.594 25.5369 102.148 27.2698C102.536 27.7027 102.883 28.1317 103.194 28.5479C104.333 30.0766 103.875 32.2471 102.206 33.2019C101.956 33.345 101.692 33.4863 101.415 33.6237C99.5897 34.528 98.0313 34.9127 97.4325 35.0826C92.3161 36.5339 90.7593 37.0841 83.8094 38.3379C79.6144 39.0946 75.6253 39.5222 72.0718 39.7521H72.0718Z"
                                                fill="url(#paint2_linear_399_5255)"
                                            />
                                            <path
                                                opacity="0.29"
                                                d="M75.2694 34.5914C72.1702 34.7901 69.4124 32.7123 68.8449 29.7533C68.7716 29.3709 68.6977 29.0062 68.6245 28.6598C68.3169 27.2045 67.8933 25.2327 67.0271 22.7159C66.6731 21.6876 66.3227 20.7934 66.0171 20.062C65.7801 19.4947 65.9443 18.8366 66.4377 18.4546C66.4425 18.451 66.4472 18.4473 66.452 18.4437C66.683 18.2683 66.9043 18.1813 67.0271 18.1341C67.4784 17.9605 67.8739 17.9497 68.0494 17.9484C70.6589 17.9285 72.1389 18.258 72.1389 18.258C74.3528 18.6504 74.9676 18.72 77.2507 19.3105C78.8313 19.7193 81.3503 20.3802 84.5351 21.6633C85.7122 22.1376 88.107 23.1507 90.7332 24.7591C91.7129 25.3591 92.6613 26.003 93.6087 27.05C93.8453 27.3115 94.057 27.5707 94.2461 27.8222C94.9407 28.7458 94.6617 30.0571 93.6437 30.634C93.4912 30.7204 93.3304 30.8058 93.1614 30.8888C92.0486 31.4352 91.0983 31.6676 90.7332 31.7702C87.6135 32.647 86.6642 32.9795 82.4265 33.7369C79.8685 34.1942 77.4362 34.4525 75.2694 34.5914Z"
                                                fill="url(#paint3_linear_399_5255)"
                                            />
                                            <path
                                                d="M15.2536 15.0426C18.0897 15.0426 20.6369 16.1394 22.3904 17.8807H29.0889C26.6643 13.2731 21.3824 10.0764 15.2536 10.0764C6.82943 10.0764 0 16.1116 0 23.5565C0 31.0013 6.82943 37.0363 15.2536 37.0363C21.3824 37.0363 26.6643 33.8396 29.0889 29.232H22.3904C20.6369 30.9735 18.0897 32.0701 15.2536 32.0701C9.96379 32.0701 5.67551 28.2583 5.67551 23.5565C5.67551 18.8546 9.96379 15.0426 15.2536 15.0426Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M58.0438 10.7859H52.368V23.5564C52.368 28.2577 48.0789 32.07 42.7915 32.07C39.2645 32.07 36.406 28.8934 36.406 24.9751V10.7859H30.7305V24.9383C30.7305 31.5814 36.0879 37.0138 42.7314 37.0362C45.1952 37.0445 47.5221 36.5342 49.5838 35.6241C50.7805 35.0958 51.7444 34.1555 52.3275 32.9893V36.3396H58.0441V28.1121H58.0438V10.7859Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M76.815 10.0764C74.4046 10.0764 72.1264 10.5729 70.1008 11.4543C68.8791 11.9858 67.8838 12.9257 67.2863 14.1098V10.7763H61.5697V10.7859H61.5625V36.327H67.238V23.5565C67.238 18.8549 71.5272 15.0426 76.815 15.0426C80.3415 15.0426 83.2001 18.2192 83.2001 22.1376H88.8758C88.8758 15.476 83.4761 10.0764 76.815 10.0764V10.0764Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M113.56 10.7859L107.688 22.5802L103.367 31.2206L100.789 26.0675L93.1804 10.7859H87.6328L100.35 36.3269H106.391L119.108 10.7859H113.56Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M147.999 23.5565C147.999 22.8316 147.935 22.1207 147.81 21.4282C146.656 14.9935 140.35 10.0764 132.747 10.0764C124.322 10.0764 117.492 16.1116 117.492 23.5565C117.492 31.0013 124.322 37.0363 132.747 37.0363C138.876 37.0363 144.161 33.8408 146.584 29.232H139.885C138.131 30.9744 135.583 32.0701 132.747 32.0701C128.284 32.0701 124.534 29.357 123.469 25.685H147.81C147.935 24.9926 147.999 24.2811 147.999 23.5565V23.5565ZM132.747 15.0426C137.202 15.0426 140.948 17.7488 142.019 21.4136H123.559C123.754 20.7012 124.116 19.8992 124.464 19.2798C126.124 16.7459 129.211 15.0426 132.747 15.0426Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M40.1895 44.3887C38.0914 44.3887 36.1078 44.8205 34.3444 45.5881C33.2716 46.0549 32.3995 46.8832 31.8813 47.9267V45.0029H26.9062V52.2919H26.914V74.6436H31.8535V56.1201C31.8535 52.0286 35.5864 48.7107 40.1899 48.7107C44.792 48.7107 48.5243 52.0286 48.5243 56.1201C48.5243 60.2116 46.0365 63.5295 42.9676 63.5295C39.8984 63.5295 37.4106 60.7649 37.4106 57.3549H32.4708C32.4708 63.1523 37.17 67.8516 42.9676 67.8516C48.7647 67.8516 53.4639 62.5992 53.4639 56.1201C53.4639 49.6409 47.5201 44.3887 40.1895 44.3887L40.1895 44.3887Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M67.8689 44.3887C60.5372 44.3887 54.5938 49.641 54.5938 56.1201C54.5938 62.5991 60.5372 67.8516 67.8689 67.8516C75.2002 67.8516 81.1436 62.5992 81.1436 56.1201C81.1436 49.6409 75.2002 44.3887 67.8689 44.3887ZM67.8689 63.5295C63.265 63.5295 59.5333 60.2122 59.5333 56.1201C59.5333 52.028 63.265 48.7107 67.8689 48.7107C72.4722 48.7107 76.2041 52.028 76.2041 56.1201C76.2041 60.2122 72.4722 63.5295 67.8689 63.5295Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M95.5017 44.3887C88.1698 44.3887 82.2266 49.641 82.2266 56.1201C82.2266 62.5991 88.1698 67.8516 95.5017 67.8516C102.833 67.8516 108.776 62.5992 108.776 56.1201C108.776 49.6409 102.833 44.3887 95.5017 44.3887ZM95.5017 63.5295C90.898 63.5295 87.1659 60.2122 87.1659 56.1201C87.1659 52.028 90.898 48.7107 95.5017 48.7107C100.105 48.7107 103.837 52.028 103.837 56.1201C103.837 60.2122 100.105 63.5295 95.5017 63.5295Z"
                                                fill="white"
                                            />
                                            <path
                                                d="M118.12 63.5297C116.757 63.5297 115.65 62.6997 115.65 61.6771V37.5972H110.711V61.6771C110.711 65.0871 114.029 67.8517 118.12 67.8517H121.208V63.5297H118.12Z"
                                                fill="white"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_399_5255"
                                                    x1="40.8431"
                                                    y1="70.6487"
                                                    x2="99.4298"
                                                    y2="7.75412"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="paint1_linear_399_5255"
                                                    x1="39.7191"
                                                    y1="69.7136"
                                                    x2="70.4301"
                                                    y2="53.5694"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="paint2_linear_399_5255"
                                                    x1="63.0874"
                                                    y1="34.9629"
                                                    x2="78.9346"
                                                    y2="5.70374"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="paint3_linear_399_5255"
                                                    x1="69.7911"
                                                    y1="31.6979"
                                                    x2="79.3171"
                                                    y2="13.947"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.66" />
                                                    <stop
                                                        offset="1"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </Carousel.Item>
                                </Carousel>
                                <div className="ApyBarWrapper">
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
                                <div className="PieChartWrapper">
                                    <Chart data={chartData} />
                                </div>
                            </div>
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
