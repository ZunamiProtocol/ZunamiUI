import React, { useEffect, useState, Suspense, lazy } from 'react';
import { InfoBlock } from '../components/InfoBlock/InfoBlock';
import { BalanceInfoBlock } from '../components/BalanceInfoBlock/BalanceInfoBlock';
import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
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
import { log } from '../utils/logger';
import usePausedContract from '../hooks/usePausedContract';
import { EthMergeWarningModal } from '../components/EthMergeWarningModal/EthMergeWarningModal';
import useUzdBalance from '../hooks/useUzdBalance';
import { isBSC, isETH, isPLG } from '../utils/zunami';
import { FastDepositForm } from '../components/FastDepositForm/FastDepositForm';
import Carousel from 'react-bootstrap/Carousel';
import { Pendings } from '../components/Pendings/Pendings';

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

const WalletStatus = lazy(() =>
    import('../components/WalletStatus/WalletStatus').then((module) => ({
        default: module.WalletStatus,
    }))
);

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

            // if user has minted UZD
            if (uzdBalance.toNumber()) {
                totalIncomeBalance = totalIncomeBalance.plus(uzdBalance.dividedBy(lpPrice));
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

    const pdElement = (
        <div className="d-flex">
            <PendingBalance
                val={`PD: $${getBalanceNumber(
                    pendingOperations.deposit,
                    isETH(chainId) || isPLG(chainId) ? 6 : 18
                ).toFixed(2)}`}
                hint={`You have $${pendingOperations.deposit} in pending deposit`}
            />
            <PendingBalance
                val={`PW: $${getBalanceNumber(pendingWithdraw).toFixed(2)}`}
                hint={`You have $${pendingWithdraw} in pending withdraw`}
            />
        </div>
    );

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

    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <React.Fragment>
                <MobileSidebar />
                <div className="container">
                    <EthMergeWarningModal show={showMergeModal} />
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
                            <div
                                className="d-flex d-lg-none gap-3 mt-4 pb-3"
                                style={{
                                    fontSize: '13px',
                                    overflowX: 'scroll',
                                }}
                            >
                                <a
                                    href="/dashboard"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/dashboard.png" alt="" />
                                    <span className="text-muted mt-2">Dashboard</span>
                                </a>
                                <a
                                    href="/deposit"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/deposit.png" alt="" />
                                    <span className="text-muted mt-2">Deposit</span>
                                </a>
                                <a
                                    href="/uzd"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/uzd.png" alt="" />
                                    <span className="text-muted mt-2">UZD</span>
                                </a>
                                <a
                                    href="/dao"
                                    className="text-center d-flex flex-column text-decoration-none"
                                >
                                    <img src="/dao.png" alt="" />
                                    <span className="text-muted mt-2">DAO</span>
                                </a>
                            </div>
                            <div className="Sidebar__Content__Data">
                                <div className="title">Your data</div>
                                <div className="values">
                                    <div className="balance">
                                        <div className="title">Balance</div>
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
                                <div
                                    style={{
                                        backgroundColor: '#E9E9E9',
                                        height: '1px',
                                        marginTop: '20px',
                                        marginBottom: '20px',
                                    }}
                                ></div>
                                <div className="profits">
                                    <div className="daily">
                                        <div className="title">Daily profit</div>
                                        <div className="value">
                                            {`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="monthly">
                                        <div className="title">Monthly profit</div>
                                        <div className="value">
                                            {`${monthlyProfit ? monthlyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="yearly">
                                        <div className="title">Yearly profit</div>
                                        <div className="value">
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
                            <Header />
                            <div className="dashboard">
                                <div className="fast-deposit-wrapper">
                                    <FastDepositForm />
                                </div>
                                <div className="features-slider"></div>
                                {/* <Carousel className="features-slider" fade>
                                    <Carousel.Item className="uzd">
                                        <span className="title">Zunami Universe</span>
                                        <svg className="uzd-logo" width="134" height="154" viewBox="0 0 134 154" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M133.304 96.2632L129.728 89.5694C129.356 88.8749 128.849 88.2597 128.236 87.7589C127.623 87.2582 126.916 86.8818 126.156 86.6514C125.396 86.4174 124.597 86.3339 123.804 86.4056C123.011 86.4773 122.241 86.7029 121.537 87.0694L88.2068 104.421L72.3009 74.6446L97.2053 15.3472C97.6018 14.4109 97.744 13.3887 97.6178 12.3815C97.5784 11.508 97.3446 10.6538 96.933 9.87965L93.3577 3.18767C92.9866 2.49309 92.4801 1.87778 91.8673 1.37713C91.2545 0.876489 90.5475 0.500399 89.7869 0.270492C89.027 0.0367035 88.2276 -0.046732 87.435 0.0248464C86.6424 0.0964248 85.8722 0.321606 85.1679 0.687617L44.1891 22.0212L35.9183 6.53906C35.547 5.84456 35.0402 5.22928 34.4275 4.72852C33.8147 4.22776 33.108 3.85138 32.3475 3.62098C31.5877 3.38613 30.7884 3.30224 29.9956 3.37398C29.2028 3.44573 28.4323 3.6717 27.7285 4.039L20.9494 7.56749C20.2458 7.9342 19.6225 8.43441 19.1153 9.03945C18.608 9.64449 18.2267 10.3424 17.9933 11.0933C17.7562 11.8433 17.6713 12.6322 17.7438 13.4147C17.8163 14.1971 18.0448 14.9577 18.4159 15.6529L26.6867 31.1324L3.23025 43.3432C2.52673 43.7093 1.90329 44.2092 1.39614 44.814C0.888984 45.4188 0.508112 46.1165 0.275088 46.8671C0.0375425 47.6173 -0.0474112 48.4064 0.0251063 49.1891C0.0976239 49.9718 0.326186 50.7325 0.697645 51.4277L4.27298 58.1196C4.64401 58.8142 5.1505 59.4295 5.76331 59.9302C6.37612 60.4308 7.08316 60.8069 7.84376 61.0368C8.60359 61.2708 9.4025 61.3545 10.1951 61.2829C10.9878 61.2113 11.7585 60.9859 12.4627 60.6197L35.9164 48.4098L50.4627 75.6398L24.246 138.061C23.9022 138.919 23.7515 139.841 23.8044 140.762C23.8601 141.684 24.1183 142.583 24.5611 143.397C24.6477 143.555 24.7141 143.683 24.7824 143.815L28.5181 150.812C28.889 151.507 29.3953 152.122 30.0079 152.623C30.6206 153.123 31.3275 153.499 32.0879 153.729C32.6718 153.909 33.2797 154 33.8911 154C34.8725 153.999 35.8391 153.763 36.7078 153.312L79.9351 130.808L84.9448 140.186C85.3158 140.881 85.8223 141.496 86.4351 141.997C87.0479 142.498 87.755 142.874 88.5156 143.104C89.2754 143.338 90.0743 143.421 90.8669 143.35C91.6596 143.278 92.4303 143.053 93.1345 142.686L99.9146 139.157C100.618 138.79 101.241 138.29 101.748 137.685C102.255 137.08 102.636 136.383 102.869 135.632C103.106 134.882 103.19 134.093 103.118 133.311C103.045 132.528 102.817 131.768 102.446 131.073L97.4375 121.697L130.769 104.346C131.473 103.979 132.096 103.479 132.603 102.875C133.111 102.27 133.492 101.572 133.725 100.821C133.962 100.071 134.047 99.2828 133.975 98.5007C133.903 97.7185 133.674 96.9582 133.304 96.2632V96.2632ZM53.4188 39.2987L69.1691 31.1L60.309 52.1954L53.4188 39.2987ZM70.7054 113.532L51.8461 123.348L62.4546 98.0881L70.7054 113.532Z" fill="url(#paint0_linear_101_731)"/>
                                            <defs>
                                                <linearGradient id="paint0_linear_101_731" x1="17.6316" y1="8.40805" x2="101.757" y2="104.551" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="white" stopOpacity="0.66"/>
                                                    <stop offset="0.845106" stopColor="white" stopOpacity="0"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="uzd">
                                            <svg width="45" height="43" viewBox="0 0 45 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M35.1356 0.702759V21.2641C35.1356 28.8334 28.1706 34.971 19.585 34.971C13.8579 34.971 9.21636 29.8563 9.21636 23.5475V0.702759H2.43726e-05V23.4891C-0.00814437 28.6305 2.03736 33.5659 5.68923 37.216C9.3411 40.8661 14.3022 42.9339 19.4875 42.9671C23.3164 42.9919 27.1078 42.2174 30.6148 40.6937C32.5823 39.8223 34.1754 38.2889 35.1122 36.3648V41.8076H35.1356V41.8254H44.3518V0.702759H35.1356Z" fill="white"/>
                                            </svg>
                                            <svg style={{ marginLeft: '3px' }} width="39" height="42" viewBox="0 0 39 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0.303711 5.12901V8.76819H25.3113L0.303711 33.4211V41.6625H38.2889V33.4211H36.0046V33.4203H14.1057L15.4723 31.8617C15.562 31.7682 15.6506 31.6737 15.7364 31.5764L18.2075 28.7763L38.2889 8.38762V0.712524H0.303711V5.12901Z" fill="white"/>
                                            </svg>
                                            <svg width="50" height="56" viewBox="0 0 50 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M40.7846 0V0.00160823H40.772V19.1865C39.6641 17.2842 37.9662 15.7875 35.9311 14.9191C32.5711 13.4002 28.927 12.5976 25.2344 12.5633C11.5584 12.5633 0.470215 22.2777 0.470215 34.2631C0.470215 46.2465 9.23633 55.9629 20.0522 55.9629C22.6239 55.9629 25.1704 55.4608 27.5463 54.485C29.9222 53.5092 32.081 52.079 33.8994 50.276C35.7177 48.4729 37.1602 46.3324 38.1442 43.9766C39.1282 41.6209 39.6345 39.096 39.6343 36.5462H30.4184C30.4184 42.854 25.7775 47.9679 20.0522 47.9679C14.326 47.9679 9.68517 41.8313 9.68517 34.2631C9.68517 26.6949 16.6491 20.5583 25.2344 20.5583C33.8228 20.5583 40.7856 26.6949 40.7856 34.2631V54.8213H50.0005V0H40.7846Z" fill="white"/>
                                            </svg>
                                        </div>
                                        <span className="description">The first high-profitable stablecoin</span>
                                    </Carousel.Item>
                                    <Carousel.Item className="nft">
                                        <span className="title">Zunami Universe</span>
                                        <svg className="logo" width="86" height="88" viewBox="0 0 86 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M69.18 0V30.8717C69.18 32.1841 68.6586 33.4427 67.7306 34.3707C66.8026 35.2987 65.544 35.82 64.2316 35.8201C62.8819 35.803 61.5888 35.2752 60.6126 34.3429C59.6964 33.416 59.1681 32.1746 59.1353 30.8717V0H51.8746L43.478 14.5433V30.8717C43.478 31.2627 43.4916 31.6503 43.5136 32.0355H49.2782V45.0764C49.3882 45.1914 49.4954 45.309 49.608 45.4216C53.4976 49.2741 58.7571 51.4256 64.2316 51.4037C69.9183 51.4037 74.7928 49.4096 78.8549 45.4216C82.9172 41.3593 84.9111 36.5587 84.9111 30.8717V0H69.18Z" fill="white"/>
                                            <path d="M27.253 34.861H45.3478V50.5921H0L20.089 15.806H7.63376V0.074585H47.3417L27.253 34.861Z" fill="white"/>
                                            <path d="M38.2617 65.6045H41.4433L47.0542 78.9544H47.3121V65.6045H49.0751V80.6528H45.872L40.2824 67.3244H40.0244V80.6528H38.2617V65.6045Z" fill="white"/>
                                            <path d="M52.7729 65.6045H62.017V67.2168H54.5356V72.3117H61.6084V73.9025H54.5356V80.6528H52.7729V65.6045Z" fill="white"/>
                                            <path d="M63.4766 65.6045H75.2787V67.2168H70.2483V80.6528H68.4857V67.2168H63.4766V65.6045Z" fill="white"/>
                                            <path d="M70.9692 87.9997H40.2492C36.4312 87.9997 32.7696 86.483 30.0699 83.7833C27.3702 81.0836 25.8535 77.422 25.8535 73.604C25.8535 69.7861 27.3702 66.1245 30.0699 63.4248C32.7696 60.7251 36.4312 59.2084 40.2492 59.2084H70.9692C72.8597 59.2084 74.7316 59.5807 76.4782 60.3042C78.2248 61.0276 79.8117 62.088 81.1485 63.4248C82.4853 64.7615 83.5456 66.3485 84.2691 68.0951C84.9925 69.8416 85.3649 71.7136 85.3649 73.604C85.3649 75.4945 84.9925 77.3665 84.2691 79.113C83.5456 80.8596 82.4853 82.4466 81.1485 83.7833C79.8117 85.1201 78.2248 86.1805 76.4782 86.9039C74.7316 87.6274 72.8597 87.9997 70.9692 87.9997ZM40.2492 61.255C36.9751 61.2566 33.8357 62.5584 31.5211 64.8741C29.2066 67.1899 27.9064 70.33 27.9064 73.604C27.9064 76.8781 29.2066 80.0182 31.5211 82.3339C33.8357 84.6497 36.9751 85.9515 40.2492 85.9531H70.9692C72.5914 85.9539 74.1979 85.6351 75.6969 85.0149C77.1959 84.3947 78.558 83.4852 79.7054 82.3384C80.8528 81.1916 81.7629 79.8299 82.3839 78.3313C83.0049 76.8326 83.3246 75.2263 83.3246 73.604C83.3246 71.9818 83.0049 70.3755 82.3839 68.8768C81.7629 67.3782 80.8528 66.0165 79.7054 64.8697C78.558 63.7229 77.1959 62.8134 75.6969 62.1932C74.1979 61.573 72.5914 61.2542 70.9692 61.255H40.2492Z" fill="white"/>
                                        </svg>
                                        <svg className="shark" width="183" height="176" viewBox="0 0 183 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M42.5978 152.163C25.4181 147.294 3.94838 138.87 0 126.509C6.25554 117.917 26.976 116.864 44.2028 117.632C57.4038 118.221 68.5008 129.022 67.1112 139.923V139.923C65.8381 149.91 54.5572 155.553 42.5978 152.163Z" fill="#768189"/>
                                            <path d="M43.368 153.718C34.0416 151.068 23.1358 147.113 13.4058 141.372C22.198 129.539 18.3723 115.259 18.3713 115.25C25.2424 115.415 36.1351 116.204 46.21 117.039C59.0756 118.106 69.5278 128.683 68.1783 139.269L67.8962 141.482C66.6225 151.473 55.3317 157.117 43.368 153.718Z" fill="#381BFF"/>
                                            <path d="M21.8822 115.363C25.3025 130.679 21.0328 138.045 17.1373 143.733C16.0891 143.259 14.1787 141.774 13.4058 141.372C22.198 129.539 18.3724 115.259 18.3714 115.25C19.5458 115.278 20.7161 115.316 21.8822 115.363Z" fill="white"/>
                                            <path d="M146.147 89.4448C146.147 89.4448 172.053 107.695 183 124.161C183 124.161 159.87 135.27 150.971 150.773" fill="#768189"/>
                                            <path d="M150.971 150.773C152.424 148.293 154.128 145.969 156.056 143.838C156.164 137.292 156.114 130.162 155.861 122.397C155.568 112.824 154.346 103.303 152.213 93.9669C148.559 91.1456 146.147 89.4448 146.147 89.4448L150.971 150.773Z" fill="#5C6A71"/>
                                            <path d="M29.1258 28.5148C35.584 5.23309 37.1351 -9.9546 81.8258 8.42336C105.305 18.0786 148.777 55.8311 150.948 122.556C151.816 149.214 150.304 168.45 148.175 181.944L84.0876 190.291L42.6129 190.266L42.6134 190.267C42.4731 189.884 42.3405 189.498 42.1981 189.116C40.1965 183.745 38.3879 175.896 38.0246 164.734C37.1427 137.636 33.7129 121.413 29.7704 103.165C25.828 84.9174 22.9163 50.8992 29.1258 28.5148Z" fill="#8BA8AF"/>
                                            <path d="M81.8263 8.42338C37.1356 -9.95463 35.5843 5.23312 29.1261 28.5148C27.5798 34.0894 26.5998 40.3858 26.0596 46.9802C30.1055 39.1147 36.3777 31.9698 45.8667 31.661C67.2952 30.9636 99.9695 77.2809 106.883 123.066L147.954 97.108C137.393 46.1505 102.134 16.7745 81.8263 8.42338Z" fill="#768189"/>
                                            <path d="M134.624 103.05L143.813 97.2425C133.252 46.285 97.9933 16.9089 77.6855 8.5578C74.6216 7.29791 71.7674 6.20134 69.0938 5.24866C85.2887 17.6036 122.933 51.1174 134.624 103.05Z" fill="#7E888E"/>
                                            <path d="M49.8239 44.1471C49.7028 44.569 49.6778 45.0127 49.7509 45.4455C49.8125 45.8141 49.9373 46.1693 50.1197 46.4955C50.3018 46.8219 50.5398 47.1137 50.8229 47.3576C51.1548 47.6457 51.5477 47.8548 51.9721 47.969C52.0951 47.5471 52.1208 47.1028 52.0472 46.6695C51.986 46.3008 51.8604 45.9458 51.6763 45.6206C51.4924 45.2952 51.2539 45.004 50.971 44.7597C50.6393 44.4723 50.2473 44.2629 49.8239 44.1471Z" fill="#3C3C3B"/>
                                            <path d="M42.2103 48.52C42.5646 48.2561 42.8555 47.9164 43.0618 47.5256C43.2384 47.1925 43.3568 46.8315 43.4117 46.4584C43.4671 46.0855 43.4571 45.7057 43.3821 45.3362C43.2958 44.9023 43.1126 44.4935 42.8461 44.1404C42.4902 44.4032 42.1983 44.743 41.9922 45.1344C41.8153 45.4673 41.6976 45.8286 41.6447 46.2019C41.5913 46.5752 41.6021 46.9549 41.6767 47.3245C41.7633 47.7578 41.9456 48.1662 42.2103 48.52Z" fill="#3C3C3B"/>
                                            <path d="M114.392 81.7172C112.675 83.1568 111.077 84.3696 109.381 85.5404C108.523 86.1013 107.677 86.687 106.782 87.2319C105.903 87.8113 104.984 88.3369 104.069 89.0251C105.194 89.0438 106.314 88.8673 107.379 88.5034C108.447 88.1489 109.46 87.6475 110.39 87.0138C111.322 86.3738 112.156 85.6017 112.866 84.7218C113.596 83.8494 114.118 82.8218 114.392 81.7172Z" fill="#3C3C3B"/>
                                            <path d="M98.7579 33.3457C97.5331 32.839 96.2513 32.4829 94.9406 32.2852C93.6801 32.0825 92.4066 31.9706 91.13 31.9503C89.8545 31.9258 88.5789 31.9934 87.3131 32.1524C85.997 32.3026 84.7037 32.6102 83.4609 33.0687C84.6655 33.6354 85.9416 34.0356 87.2541 34.2582C88.5189 34.487 89.8005 34.6107 91.0857 34.6283C92.3699 34.6499 93.6538 34.5684 94.925 34.3846C96.2427 34.2079 97.5314 33.8586 98.7579 33.3457Z" fill="#3C3C3B"/>
                                            <path d="M117.331 89.6632C115.615 91.1029 114.016 92.3156 112.321 93.4864C111.463 94.0473 110.616 94.633 109.722 95.178C108.842 95.7573 107.923 96.283 107.009 96.9712C108.134 96.9899 109.253 96.8133 110.318 96.4494C111.386 96.0949 112.4 95.5935 113.33 94.9598C114.262 94.3198 115.095 93.5477 115.805 92.6678C116.536 91.7954 117.058 90.7678 117.331 89.6632Z" fill="#3C3C3B"/>
                                            <path d="M92.7172 57.8663C96.7981 57.8663 100.106 54.5581 100.106 50.4772C100.106 46.3963 96.7981 43.0881 92.7172 43.0881C88.6363 43.0881 85.3281 46.3963 85.3281 50.4772C85.3281 54.5581 88.6363 57.8663 92.7172 57.8663Z" fill="#C1C1C1"/>
                                            <path d="M92.6496 55.036C95.1129 55.036 97.1098 53.0391 97.1098 50.5758C97.1098 48.1125 95.1129 46.1156 92.6496 46.1156C90.1863 46.1156 88.1895 48.1125 88.1895 50.5758C88.1895 53.0391 90.1863 55.036 92.6496 55.036Z" fill="#3C3C3B"/>
                                            <path d="M97.5992 52.0782C98.5374 52.0782 99.2979 51.3177 99.2979 50.3794C99.2979 49.4412 98.5374 48.6807 97.5992 48.6807C96.661 48.6807 95.9004 49.4412 95.9004 50.3794C95.9004 51.3177 96.661 52.0782 97.5992 52.0782Z" fill="white"/>
                                            <path d="M126.078 86.0004C126.078 86.0004 122.895 74.7116 118.944 67.8042" stroke="#A3B2BA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path opacity="0.03" d="M62.6189 62.8865H96.8892C97.9481 62.8845 98.9708 62.5016 99.7706 61.8076C100.57 61.1137 101.094 60.1552 101.245 59.1072L103.551 42.8048C103.706 41.6506 103.399 40.4821 102.697 39.5527C101.996 38.6233 100.956 38.008 99.8038 37.8404C99.6021 37.8137 99.3986 37.803 99.1952 37.8083H60.9214C60.3447 37.8065 59.7733 37.9188 59.2401 38.1386C58.7069 38.3585 58.2225 38.6817 57.8147 39.0895C57.4069 39.4973 57.0837 39.9817 56.8639 40.5149C56.644 41.0481 56.5317 41.6195 56.5336 42.1962C56.5271 42.3464 56.5378 42.4969 56.5656 42.6446L58.2631 58.947C58.3661 60.029 58.8703 61.0333 59.6763 61.7623C60.4824 62.4913 61.5321 62.8924 62.6189 62.8865Z" fill="#381BFF"/>
                                            <path opacity="0.03" d="M30.3028 62.8865H20.5982C19.5394 62.8845 18.5166 62.5016 17.7168 61.8076C16.9171 61.1137 16.3937 60.1552 16.2424 59.1072L13.9684 42.8048C13.8138 41.6506 14.1205 40.4821 14.8221 39.5527C15.5236 38.6233 16.5634 38.008 17.7157 37.8404C17.9174 37.8137 18.1209 37.803 18.3242 37.8083H32.0324C32.6091 37.8065 33.1805 37.9188 33.7137 38.1386C34.2468 38.3585 34.7313 38.6817 35.1391 39.0895C35.5469 39.4973 35.87 39.9817 36.0899 40.5149C36.3098 41.0481 36.422 41.6195 36.4202 42.1962C36.4267 42.3464 36.4159 42.4969 36.3882 42.6446L34.6907 58.947C34.581 60.0321 34.0705 61.0372 33.259 61.7658C32.4475 62.4944 31.3934 62.894 30.3028 62.8865Z" fill="#381BFF"/>
                                            <path d="M58.6473 44.0215C58.8203 44.0234 58.9919 43.9908 59.1521 43.9255C59.3123 43.8602 59.4578 43.7635 59.5802 43.6412C59.7025 43.5189 59.7991 43.3734 59.8645 43.2132C59.9298 43.053 59.9624 42.8814 59.9605 42.7084C59.9584 42.4743 59.8953 42.2448 59.7773 42.0426C59.6593 41.8404 59.4907 41.6724 59.2879 41.5554C51.1848 36.8472 44.5869 37.1034 40.5193 38.1604C36.0354 39.3134 33.5052 41.6194 33.4091 41.7155C33.1756 41.9746 33.0545 42.3159 33.0726 42.6642C33.0906 43.0126 33.2462 43.3395 33.5052 43.5731C33.7344 43.7837 34.0311 43.9057 34.3421 43.9175C34.6532 43.9292 34.9582 43.8298 35.2027 43.6372C35.555 43.3169 44.0745 35.7583 57.9748 43.7973C58.1667 43.9468 58.4041 44.0259 58.6473 44.0215Z" fill="#381BFF"/>
                                            <path d="M62.6194 63.7831H96.8897C98.1604 63.7762 99.3864 63.3133 100.345 62.4786C101.303 61.6439 101.929 60.4929 102.11 59.2351L104.416 42.9647C104.513 42.2791 104.474 41.5811 104.301 40.9107C104.128 40.2402 103.825 39.6104 103.408 39.0572C102.992 38.504 102.471 38.0382 101.874 37.6865C101.278 37.3348 100.618 37.104 99.9324 37.0074C99.6886 36.9688 99.4424 36.9474 99.1957 36.9434H60.9219C59.529 36.9442 58.1935 37.4978 57.2086 38.4827C56.2237 39.4676 55.67 40.8032 55.6692 42.196C55.6629 42.3781 55.6737 42.5604 55.7012 42.7405L57.3987 59.0429C57.5144 60.3443 58.1158 61.5546 59.0831 62.4329C60.0504 63.3112 61.3128 63.7932 62.6194 63.7831ZM99.1636 38.6729C100.099 38.6882 100.991 39.0687 101.649 39.733C102.307 40.3973 102.68 41.2928 102.687 42.228C102.692 42.3888 102.681 42.5498 102.655 42.7085L100.381 59.0109C100.258 59.8487 99.8379 60.6144 99.1967 61.1674C98.5555 61.7203 97.7364 62.0236 96.8896 62.0216H62.6193C61.7523 62.0226 60.9157 61.7023 60.2709 61.1227C59.6262 60.543 59.2191 59.745 59.1283 58.8828L57.3987 42.5803C57.3117 41.6523 57.5914 40.7271 58.1781 40.0028C58.7647 39.2784 59.6116 38.8126 60.5375 38.7049C60.6656 38.7049 60.7617 38.6729 60.8898 38.6729H99.1636Z" fill="#381BFF"/>
                                            <path d="M20.5654 63.7831H30.2699C31.5706 63.7794 32.8245 63.2976 33.793 62.4295C34.7616 61.5613 35.3771 60.3674 35.5226 59.0749L37.2201 42.7725C37.3658 41.3842 36.9556 39.9947 36.0792 38.9082C35.2028 37.8217 33.9316 37.1267 32.544 36.9754C32.3637 36.9497 32.1816 36.9389 31.9995 36.9433H18.3235C16.9306 36.9442 15.5951 37.4978 14.6102 38.4827C13.6253 39.4676 13.0716 40.8032 13.0708 42.196C13.0748 42.4428 13.0962 42.6889 13.1348 42.9327L15.4088 59.2351C15.581 60.4851 16.1962 61.6319 17.1426 62.4666C18.089 63.3013 19.3036 63.7684 20.5654 63.7831ZM31.9996 38.7049C32.9331 38.7076 33.8276 39.0797 34.4878 39.7398C35.1479 40.3999 35.52 41.2945 35.5227 42.228C35.5279 42.3464 35.5172 42.4649 35.4907 42.5803L33.7931 58.8827C33.7023 59.745 33.2952 60.543 32.6504 61.1227C32.0057 61.7023 31.1691 62.0226 30.302 62.0215H20.5974C19.7507 62.0236 18.9316 61.7203 18.2904 61.1673C17.6491 60.6144 17.2288 59.8487 17.1064 59.0109L14.8324 42.7085C14.7076 41.783 14.9542 40.8458 15.5184 40.1016C16.0825 39.3574 16.9183 38.8668 17.843 38.7369C18.0017 38.7103 18.1626 38.6996 18.3235 38.7049H31.9996Z" fill="#381BFF"/>
                                            <path d="M49.0981 71.4489C49.1519 71.1054 52.8768 71.8295 58.7126 69.5806C64.5484 67.3316 63.527 73.8479 56.6602 75.6778C49.7934 77.5077 48.5874 74.707 49.0981 71.4489Z" fill="white"/>
                                            <path d="M42.0079 192.835C39.8404 187.29 38.3297 181.509 37.5065 175.612C36.7164 169.941 36.9753 167.085 36.5279 159.368C36.1561 152.954 35.5624 148.307 34.375 139.013C33.3907 131.308 31.9683 121.632 29.8735 110.439C34.6822 114.472 43.4345 120.643 55.7081 123.16C58.933 123.822 71.0072 125.995 91.7199 119.05C115.98 110.916 133.621 96.4646 144.955 84.7998C149.065 97.3257 150.677 112.206 151.805 129.227C153.011 147.454 152.289 165.757 149.652 183.832C130.343 186.811 109.551 189.273 87.4142 190.878C71.6099 192.024 56.4508 192.636 42.0079 192.835Z" fill="#381BFF"/>
                                            <path d="M72.4741 129.264L52.9593 146.725L39.6069 124.129L59.1218 121.561L72.4741 129.264Z" fill="black"/>
                                            <path d="M29.3539 106.831C79.093 139.6 136.755 88.3282 143.39 82.1566C143.458 82.0933 143.541 82.0481 143.631 82.0253C143.721 82.0024 143.815 82.0026 143.905 82.0259C143.995 82.0492 144.078 82.0948 144.146 82.1585C144.213 82.2221 144.264 82.3019 144.293 82.3902C144.81 83.9903 145.302 85.6161 145.768 87.2675C145.818 87.4413 145.817 87.6254 145.768 87.7991C145.718 87.9728 145.621 88.1291 145.487 88.2506C136.894 96.0298 123.391 106.094 108.304 113.635L71.57 132.163L56.0988 124.427L40.1119 128.037L29.6388 111.556C29.3772 111.145 29.1923 110.689 29.0931 110.212C28.899 109.278 28.7033 108.343 28.5062 107.408C28.4834 107.301 28.4931 107.189 28.534 107.087C28.575 106.985 28.6454 106.897 28.7363 106.835C28.8273 106.773 28.9345 106.74 29.0445 106.739C29.1545 106.739 29.2622 106.771 29.3539 106.831Z" fill="white"/>
                                            <path d="M115.537 121.717C97.51 127.02 75.0052 136.107 70.979 149.156C77.6511 158.132 99.4662 159.025 117.586 158.037C131.471 157.28 143.036 145.799 141.46 134.342V134.342C140.017 123.846 128.087 118.026 115.537 121.717Z" fill="#768189"/>
                                            <path d="M116.332 120.073C106.545 122.959 95.1103 127.234 84.9312 133.376C94.3064 145.737 90.4293 160.804 90.4283 160.813C97.657 160.568 109.111 159.624 119.704 158.64C133.232 157.384 144.12 146.145 142.59 135.019L142.27 132.694C140.826 122.193 128.886 116.371 116.332 120.073Z" fill="#381BFF"/>
                                            <path d="M94.1217 160.658C97.5614 144.505 92.9917 136.798 88.8333 130.854C87.7352 131.363 85.7403 132.945 84.9312 133.376C94.3064 145.737 90.4294 160.804 90.4284 160.813C91.6639 160.771 92.895 160.719 94.1217 160.658Z" fill="white"/>
                                        </svg>
                                    </Carousel.Item>
                                    <Carousel.Item className="loans">
                                        <svg className="logo" width="215" height="71" viewBox="0 0 215 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19.5208 62.7209V70.7478H13.7792C6.17015 70.7478 0 65.6134 0 59.2803V14.5591H9.18605V59.2803C9.18605 61.1794 11.2435 62.7209 13.7792 62.7209H19.5208Z" fill="white"/>
                                            <path d="M68.1928 48.9606C68.1928 60.9936 57.1402 70.7483 43.5061 70.7483C29.8711 70.7483 18.8184 60.9936 18.8184 48.9606C18.8184 36.9275 29.8711 27.1729 43.5061 27.1729C57.1401 27.1729 68.1928 36.9275 68.1928 48.9606ZM59.007 48.9606C59.007 41.3608 52.0668 35.1998 43.5061 35.1998C34.9444 35.1998 28.0041 41.3608 28.0041 48.9606C28.0041 56.5603 34.9444 62.7213 43.5061 62.7213C52.0668 62.7213 59.007 56.5603 59.007 48.9606Z" fill="white"/>
                                            <path d="M214.179 57.5595C214.179 64.8431 204.926 70.7483 193.511 70.7483C182.095 70.7483 172.842 64.8431 172.842 57.5595C172.842 57.3667 172.848 57.1772 172.863 56.9875H182.098C182.052 57.1747 182.028 57.3667 182.028 57.5595C182.028 60.4091 187.169 62.7213 193.511 62.7213C199.852 62.7213 204.993 60.4091 204.993 57.5595C204.993 54.7125 199.251 53.5477 193.511 52.4012C187.839 51.2679 182.533 50.7769 178.96 48.1964C175.87 45.9637 173.99 43.0156 173.99 39.7869C173.99 32.8214 182.729 27.1729 193.511 27.1729C204.291 27.1729 213.03 32.8214 213.03 39.7869H203.845C203.845 37.2545 199.218 35.1998 193.511 35.1998C187.803 35.1998 183.176 37.2545 183.176 39.7869C183.176 42.3185 187.913 43.2557 193.511 44.3734C199.251 45.5208 204.325 45.8354 208.061 48.1964C211.839 50.5839 214.179 53.8988 214.179 57.5595Z" fill="white"/>
                                            <path d="M119.634 28.319V28.3102H110.477V33.831C109.517 31.8493 107.876 30.2773 105.854 29.4003C102.422 27.9203 98.722 27.1619 94.9839 27.1725C81.3513 27.1725 70.2979 36.9271 70.2979 48.9602C70.2979 60.9932 79.0369 70.7479 89.8185 70.7479C92.3819 70.7479 94.9203 70.2437 97.2886 69.264C99.6569 68.2843 101.809 66.8483 103.621 65.038C105.434 63.2278 106.872 61.0787 107.853 58.7136C108.834 56.3484 109.338 53.8134 109.338 51.2534H100.152C100.152 57.5866 95.526 62.721 89.8185 62.721C84.11 62.721 79.4836 56.559 79.4836 48.9602C79.4836 41.3611 86.4254 35.1994 94.9839 35.1994C103.545 35.1994 110.486 41.3611 110.486 48.9602V69.6013H119.672V28.319H119.634Z" fill="white"/>
                                            <path d="M150.124 27.1724C146.308 27.1482 142.529 27.9259 139.034 29.4549C137.046 30.3409 135.442 31.91 134.514 33.8769V29.3717C134.523 29.2082 134.527 29.0444 134.528 28.8803V28.319H125.342V69.6013H134.528V48.9601C134.528 41.3611 141.469 35.1993 150.028 35.1993C155.735 35.1993 160.362 40.3337 160.362 46.6669V69.6013H169.547V46.7274C169.547 35.9891 160.876 27.2097 150.124 27.1724Z" fill="white"/>
                                            <path d="M150.284 1.12484L151.122 0.28668C151.213 0.195792 151.321 0.123695 151.439 0.0745065C151.558 0.0253184 151.685 0 151.814 0C151.943 0 152.07 0.0253184 152.189 0.0745065C152.307 0.123695 152.415 0.195792 152.506 0.28668L153.344 1.12484C153.435 1.21573 153.507 1.32363 153.556 1.44238C153.606 1.56113 153.631 1.6884 153.631 1.81694C153.631 1.94547 153.606 2.07275 153.556 2.1915C153.507 2.31025 153.435 2.41815 153.344 2.50904L152.506 3.3472C152.415 3.43809 152.307 3.51018 152.189 3.55937C152.07 3.60856 151.943 3.63388 151.814 3.63388C151.685 3.63388 151.558 3.60856 151.439 3.55937C151.321 3.51018 151.213 3.43809 151.122 3.3472L150.284 2.50904C150.1 2.32548 149.997 2.07653 149.997 1.81694C149.997 1.55735 150.1 1.3084 150.284 1.12484ZM150.243 19.2459V5.10226H153.385V19.2459H150.243Z" fill="white"/>
                                            <path d="M141.832 4.71314C139.843 4.71314 138.059 5.68481 136.836 7.22579C136.211 6.44142 135.417 5.80813 134.514 5.37309C133.61 4.93805 132.62 4.71246 131.617 4.71314C131.105 4.71284 130.595 4.77825 130.099 4.90776C129.65 5.02775 129.235 5.24719 128.882 5.54981C128.53 5.85242 128.25 6.23046 128.064 6.6559V5.10344H126.586V5.10583H124.938V19.2495H128.081V12.1777C128.081 9.5743 129.664 7.46334 131.617 7.46334C133.57 7.46334 135.153 9.22247 135.153 11.3923V19.2495H138.296V12.1777C138.296 9.5743 139.879 7.46334 141.832 7.46334C143.785 7.46334 145.368 9.22247 145.368 11.3923V19.2495H148.51V11.3923C148.511 10.5152 148.338 9.64663 148.002 8.83626C147.667 8.02588 147.175 7.28955 146.555 6.66932C145.934 6.04909 145.198 5.5571 144.388 5.22146C143.577 4.88581 142.709 4.71308 141.832 4.71314Z" fill="white"/>
                                            <path d="M121.305 5.10587V5.10348H119.828V6.94572C119.496 6.28931 118.945 5.76957 118.27 5.47638C117.096 4.96928 115.83 4.70949 114.551 4.71317C109.886 4.71317 106.104 8.05484 106.104 12.1777C106.104 16.2999 109.094 19.6423 112.783 19.6423C116.472 19.6423 119.293 16.6524 119.293 12.9631H116.149C116.149 13.9623 116.007 14.9229 115.455 15.6162C115.135 16.0172 114.728 16.3404 114.266 16.5613C113.803 16.7823 113.296 16.8954 112.783 16.892C110.83 16.892 109.247 14.7811 109.247 12.1777C109.247 9.57433 111.623 7.46338 114.551 7.46338C117.48 7.46338 119.855 9.57434 119.855 12.1777V19.2496H122.998V5.10587H121.305Z" fill="white"/>
                                            <path d="M98.3268 4.71333C97.0211 4.70479 95.7282 4.97121 94.5322 5.49525C93.8655 5.79275 93.3248 6.31552 93.005 6.97186V5.10364H91.5275V5.10603H89.8477V19.2497H92.9905V12.1779C92.9905 9.5745 95.3657 7.46354 98.2939 7.46354C100.247 7.46354 101.829 9.22267 101.829 11.3925V19.2497H104.972V11.4126C104.975 9.64423 104.278 7.94668 103.032 6.69124C101.787 5.43581 100.095 4.72466 98.3268 4.71333Z" fill="white"/>
                                            <path d="M84.7543 5.10596V12.1778C84.7543 14.7812 82.3791 16.8921 79.4513 16.8921C77.4982 16.8921 75.9154 15.133 75.9154 12.9632V5.10596H72.7725V12.9431C72.7697 14.7114 73.4672 16.4089 74.7126 17.6643C75.958 18.9197 77.6498 19.6309 79.418 19.6423C80.7238 19.6509 82.0167 19.3845 83.2127 18.8604C83.8798 18.5624 84.4208 18.0391 84.7409 17.3822V19.2496H87.8972V5.10596H84.7543Z" fill="white"/>
                                            <path d="M58.1191 6.63176V7.88702H66.6716L58.1191 16.3905V19.2331H71.1099V16.3905H70.3287V16.3902H62.8393L63.3068 15.8526C63.3374 15.8203 63.3677 15.7877 63.3971 15.7542L64.2422 14.7883L71.1099 7.75573V5.1084H58.1191V6.63176Z" fill="white"/>
                                        </svg>
                                        <svg className="bg" width="293" height="223" viewBox="0 0 293 223" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M156.905 223C117.677 223 82.8218 209.337 55.7137 183.239C37.5567 165.759 23.5538 143.304 14.0942 116.499C4.74191 89.9995 0 59.5879 0 26.1092H61.0708C61.0708 52.5659 64.6286 76.0623 71.6455 95.945C77.8863 113.629 86.7325 128.065 97.9384 138.854C114.693 154.984 136.19 162.588 161.83 161.454C185.46 160.409 203.692 153 216.019 139.432C226.279 128.139 231.929 112.87 231.929 96.4383C232.069 87.0945 228.603 78.0599 222.26 71.233C219.287 68.0812 215.697 65.5835 211.717 63.8976C207.736 62.2116 203.452 61.3741 199.133 61.4377C193.17 61.4828 187.43 63.7277 183.003 67.7467C178.745 71.7608 173.67 80.0363 173.67 96.6649H112.599C112.599 58.0329 128.175 35.2389 141.241 22.9198C156.991 8.23546 177.659 0.0534782 199.133 0.00137066C211.694 -0.0673142 224.136 2.44607 235.697 7.38739C247.258 12.3287 257.694 19.5938 266.364 28.737C283.54 46.7777 293 70.8213 293 96.4383C293 128.248 281.67 158.236 261.098 180.88C244.827 198.789 214.862 220.605 164.511 222.831C161.959 222.944 159.424 223 156.905 223Z" fill="#9305B7" fillOpacity="0.38"/>
                                        </svg>
                                    </Carousel.Item>
                                </Carousel> */}
                                <div className="ApyBarWrapper">
                                    <div className="ApyBar">
                                        <div className="ApyBar__title">APY Bar</div>
                                        <div className="ApyBar__counters">
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title">
                                                    <span>Base APY now:</span>
                                                </div>
                                                <div className="ApyBar__Counter__Value ApyBar__Counter__Value--primary">
                                                    14.70%
                                                </div>
                                            </div>
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title">
                                                    <span>Average APY</span>
                                                </div>
                                                <div className="ApyBar__Counter__Value">
                                                    {isZunLoading
                                                        ? 'n/a'
                                                        : `${zunamiInfo.monthlyAvgApy}%`}
                                                </div>
                                            </div>
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title">
                                                    <span>Reward APY</span>
                                                </div>
                                                <div className="ApyBar__Counter__Value">soon</div>
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
                        <a href="#" className="badge rounded-pill text-bg-secondary bg-secondary">
                            Documentation
                        </a>
                        <a href="#" className="badge rounded-pill text-bg-secondary bg-secondary">
                            FAQ
                        </a>
                        <a href="#" className="badge rounded-pill text-bg-secondary bg-secondary">
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
