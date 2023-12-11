import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '../components/Header/Header';
import './Uzd.scss';
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import useUzdBalance from '../hooks/useUzdBalance';
import useTotalSupply from '../hooks/useTotalSupply';
import { BIG_TEN, BIG_ZERO, getBalanceNumber, UZD_DECIMALS } from '../utils/formatbalance';
import useUzdLpPrice from '../hooks/useUzdLpPrice';
import BigNumber from 'bignumber.js';
import { contractAddresses } from '../sushi/lib/constants';
import { log } from '../utils/logger';
import { SideBar, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import {
    getZethHistoricalApyUrl,
    getActiveStratsUrl,
    uzdStakingInfoUrl,
    getRebaseHistoryUrl,
    getZethRebaseHistoryUrl,
    getZethStratsUrl,
    getHistoricalApyUrl,
} from '../api/api';
import useFetch from 'react-fetch-hook';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
// import { UzdMigrationModal } from '../components/UzdMigrationModal/UzdMigrationModal';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { YourData } from '../components/YourData/YourData';
import { UzdStakingSummary } from '../components/UzdStakingSummary/UzdStakingSummary';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { Chart } from '../components/Chart/Chart';
import { PoolsStats } from './Main.types';
import { formatPoolApy, poolDataToChartData } from '../functions/pools';
import { RebaseHistory } from '../components/RebaseHistory/RebaseHistory';
import { Link } from 'react-router-dom';
import useZapsLpBalance from '../hooks/useZapsLpBalance';
import { SupportersBar } from '../components/SupportersBar/SupportersBar';
import { Input } from '../components/FastDepositForm/Input/Input';
import { DirectAction } from '../components/Form/DirectAction/DirectAction';
import { StakingSummary } from '../components/StakingSummary/StakingSummary';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { LockHistory } from '../components/LockHistory/LockHistory';

export interface CurveInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface iHistoryTransaction {
    chain: string;
    contractAddress: string;
    dateTime: string;
    transactionHash: string;
    value: number;
}

const getFullDisplayBalance = (balance: BigNumber, decimals = 18, roundDown = false) => {
    const newNumber = new BigNumber(balance);
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).decimalPlaces(2, 1).toString();
};

function formatUzd(sum: BigNumber) {
    return sum.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).decimalPlaces(2, 1).toString();
}

export const formatBigNumberFull = (balance: BigNumber) => {
    return balance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).decimalPlaces(18, 1).toString();
};

const addToken = async (
    ethereum: any,
    tokenSymbol: string,
    tokenDecimals: Number,
    tokenImage: string
) => {
    const tokenAddress =
        tokenSymbol === 'UZD' ? contractAddresses.uzd[1] : contractAddresses.zeth[1];

    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress,
                    symbol: tokenSymbol,
                    decimals: tokenDecimals,
                    image: tokenImage,
                },
            },
        });

        if (wasAdded) {
            console.log('Thanks for your interest!');
        } else {
            console.log('Your loss!');
        }
    } catch (error: any) {
        log(`❗️ Error while adding ${tokenSymbol} token: ${error.message}`);
    }
};

export const Uzd = (): JSX.Element => {
    const { connect, connectors } = useConnect();
    const { address: account, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? parseInt(window.ethereum?.chainId, 16) : 1;

    const zethBalance = useUzdBalance(contractAddresses.zeth[1]);
    const uzdTotalSupply = useTotalSupply(contractAddresses.uzd[1]);
    const zethTotalSupply = useTotalSupply(contractAddresses.zeth[1]);
    const lpPrice = useUzdLpPrice();
    const [supportedChain, setSupportedChain] = useState(true);
    const [hideMigrationModal, setHideMigrationModal] = useState(false);

    const apsBalance = useZapsLpBalance();
    const uzdBalance = useUzdBalance();
    const balances = useMemo(() => {
        return [
            {
                chainId: '1',
                value: apsBalance,
                key: 'APS',
            },
            {
                chainId: '1',
                value: zethBalance,
                key: 'ZETH',
            },
        ];
    }, [apsBalance, zethBalance]);

    const [stakingMode, setStakingMode] = useState('UZD');

    const [histApyPeriod, setHistApyPeriod] = useState('week');
    const [histApyData, setHistApyData] = useState([]);

    // historical APY chart data
    useEffect(() => {
        const url =
            stakingMode === 'ZETH'
                ? getZethHistoricalApyUrl(histApyPeriod)
                : getHistoricalApyUrl(histApyPeriod);

        fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((items) => {
                setHistApyData(
                    items.data.map((item: any) => {
                        if (item.apy > 500) {
                            item.apy = 500;
                        }

                        return item;
                    })
                );
            })
            .catch((error) => {
                setHistApyData([]);
            });
    }, [histApyPeriod, stakingMode]);

    useEffect(() => {
        setSupportedChain(chainId === 1);
    }, [chainId]);

    const { isLoading: uzdStatLoading, data: uzdStatData } = useFetch(
        uzdStakingInfoUrl
    ) as ZunamiInfoFetch;

    const { data: activeStratsStat } = useFetch(
        stakingMode === 'UZD' ? getActiveStratsUrl() : getZethStratsUrl()
    );
    const poolStats = activeStratsStat as PoolsStats;

    const chartData = useMemo(() => {
        if (!poolStats) {
            return [];
        }

        const stratsData = poolStats.pools ? poolStats.pools : poolStats.strategies;

        return poolStats && uzdStatData
            ? poolDataToChartData(
                  stratsData,
                  stakingMode === 'UZD'
                      ? uzdStatData.info.omnipool.tvl
                      : uzdStatData.info.zethOmnipool.tvl
              )
            : [];
    }, [stakingMode, uzdStatData, poolStats]);

    const [transactionsType, setTransactionsType] = useState('UZD');
    const [transactionList, setTransactionList] = useState([]);
    const [transHistoryPage, setTransHistoryPage] = useState(0);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const apyHintTarget = useRef(null);
    const [showApyHint, setShowApyHint] = useState(false);

    const apyBarMonthlyApy = useMemo(() => {
        let result = '0';

        if (!uzdStatData) {
            return result;
        }

        result =
            stakingMode === 'UZD'
                ? uzdStatData.info.omnipool.monthlyAvgApy
                : uzdStatData.info.zethOmnipool.monthlyAvgApy;

        if (Number(result) > 500) {
            result = '500+';
            return result;
        }

        return `${Number(result).toFixed(2)}%`;
    }, [stakingMode, uzdStatData]);

    const apyPopover = useMemo(() => {
        let apy30 = '0';
        let apy90 = '0';

        if (uzdStatData) {
            apy30 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zethAps.monthlyAvgApy
                    : uzdStatData.info.aps.monthlyAvgApy;

            apy90 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zethAps.threeMonthAvgApy
                    : uzdStatData.info.aps.threeMonthAvgApy;
        }

        if (Number(apy30) > 500) {
            apy30 = '500+';
        } else {
            apy30 = Number(apy30).toFixed(2);
        }

        if (Number(apy90) > 500) {
            apy90 = '500+';
        } else {
            apy90 = Number(apy90).toFixed(2);
        }

        return (
            <Popover
                onMouseEnter={() => setShowApyHint(true)}
                onMouseLeave={() => setShowApyHint(false)}
            >
                <Popover.Body>
                    <div className="">
                        <span>Average APY in 30 days: </span>
                        <span className="text-primary">{apy30}%</span>
                    </div>
                    <div className="">
                        <span>Average APY in 90 days: </span>
                        <span className="text-primary">{apy90}%</span>
                    </div>
                </Popover.Body>
            </Popover>
        );
    }, [stakingMode, uzdStatData]);

    const [tvl, setTvl] = useState('0');

    // TVL
    useEffect(() => {
        if (!uzdStatLoading && uzdStatData.tvl) {
            setTvl(uzdStatData.tvl);
        }
    }, [uzdStatLoading, uzdStatData?.tvl]);

    const baseApy = useMemo(() => {
        let result = '0';

        if (!uzdStatData) {
            return result;
        }

        if (stakingMode === 'UZD') {
            result = uzdStatData.info.omnipool.apy;
        }

        if (stakingMode === 'ZETH') {
            result = uzdStatData.info.zethOmnipool.apy;
        }

        if (Number(result) > 500) {
            result = '500';
        } else {
            result = Number(result).toFixed(2);
        }

        return result;
    }, [stakingMode, uzdStatData]);

    return (
        <React.Fragment>
            <MobileSidebar />
            <AllServicesPanel />
            <div className="container">
                <div className="row main-row h-100 UzdContainer">
                    {!supportedChain && (
                        <UnsupportedChain
                            text="You're using unsupported chain. Please, switch to Ethereum network."
                            customNetworksList={[networks[0]]}
                        />
                    )}
                    <SideBar isMainPage={false} tvl={tvl}>
                        <div className="row">
                            <div className="col sidebar-links mt-3 d-none d-xxl-flex">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        document
                                            .getElementById('all-services')
                                            ?.classList.toggle('active');
                                        document
                                            .getElementById('sidebar-col')
                                            ?.classList.toggle('transparent');
                                        document
                                            .getElementById('nav-menu')
                                            ?.classList.toggle('hidden');
                                    }}
                                >
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
                                            fill="url(#paint0_linear_18_112667)"
                                        />
                                        <path
                                            d="M0.155009 4.05394C0.0694001 2.42042 1.32423 1.02679 2.95775 0.941182L6.00363 0.781555C7.63715 0.695945 9.03078 1.95078 9.11639 3.5843L9.27602 6.63017C9.36163 8.26369 8.10679 9.65732 6.47327 9.74293L3.4274 9.90256C1.79388 9.98817 0.400246 8.73334 0.314637 7.09982L0.155009 4.05394Z"
                                            fill="#CDCDCD"
                                        />
                                        <defs>
                                            <linearGradient
                                                id="paint0_linear_18_112667"
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

                                    <span>All services</span>
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
                        <div className="mobile-menu-title d-block d-xxl-none">Menu</div>
                        <div
                            className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                            style={{
                                fontSize: '13px',
                                overflowX: 'scroll',
                            }}
                        >
                            <a
                                href="/"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/dashboard.png" alt="" />
                                <span className="text-muted mt-2">Dashboard</span>
                            </a>
                            <a
                                href="/zun"
                                className="text-center d-flex flex-column text-decoration-none selected"
                            >
                                <img src="/uzd.png" alt="" />
                                <span className="text-muted mt-2">ZUN Staking</span>
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
                            <a
                                href="/zun-staking"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/zun-staking.png" alt="" />
                                <span className="text-muted mt-2">ZUN Staking</span>
                            </a>
                        </div>
                        <div className="card mt-3 zun-token-card">
                            <div className="card-body p-3">
                                <div className="title ms-2 mt-2">
                                    <svg
                                        width="16"
                                        height="12"
                                        viewBox="0 0 16 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="me-2 zun-icon"
                                    >
                                        <path
                                            d="M8.56819 12C6.42605 12 4.52269 11.2648 3.04239 9.8604C2.05088 8.91977 1.28621 7.71143 0.769649 6.26901C0.258944 4.84302 0 3.20652 0 1.40498L3.33492 1.40498C3.33492 2.82866 3.52921 4.09304 3.91238 5.16296C4.25318 6.11457 4.73625 6.89139 5.34817 7.47197C6.2631 8.33995 7.437 8.74913 8.83713 8.68811C10.1275 8.63188 11.1231 8.23318 11.7963 7.50307C12.3565 6.89537 12.6651 6.07372 12.6651 5.18951C12.6727 4.6867 12.4834 4.20054 12.1371 3.83317C11.9747 3.66356 11.7787 3.52916 11.5613 3.43844C11.3439 3.34771 11.11 3.30264 10.8742 3.30607C10.5485 3.30849 10.2351 3.4293 9.99333 3.64557C9.76081 3.86157 9.48368 4.30689 9.48368 5.2017L6.14875 5.2017C6.14875 3.12285 6.99931 1.89627 7.71281 1.23336C8.57289 0.443163 9.70152 0.00287752 10.8742 7.37461e-05C11.5601 -0.00362201 12.2395 0.131628 12.8708 0.397527C13.5021 0.663427 14.072 1.05437 14.5455 1.54638C15.4835 2.51718 16 3.81101 16 5.1895C16 6.90124 15.3813 8.51494 14.2579 9.73345C13.3694 10.6972 11.7331 11.8711 8.98353 11.9909C8.84418 11.997 8.70575 12 8.56819 12Z"
                                            fill="black"
                                        />
                                    </svg>
                                    <span>ZUN Token</span>
                                </div>
                                <div className="text p-2">
                                    Lock your ZUN tokens for 4 months to participate in voting and
                                    earn income from the protocol.
                                </div>
                                <div className="balance">
                                    <div className="d-flex flex-row small-block align-items-center stablecoin mb-3 ps-3 me-3 me-lg-2 mt-3 justify-content-between">
                                        <div>
                                            <div>
                                                <span className="name">ZUN Balance</span>
                                            </div>
                                            <div className="vela-sans value mt-1 d-flex align-items-center">
                                                <img src="/zun.svg" alt="" className="me-2" />
                                                <span>2000</span>
                                            </div>
                                        </div>
                                        <div className="btns d-flex flex-row gap-2 align-items-center justify-content-center">
                                            <div
                                                onClick={async () => {
                                                    // navigator.clipboard
                                                    //     .writeText(coin.address)
                                                    //     .then(function () {
                                                    //         alert(
                                                    //             'Coin address copied to the clipboard'
                                                    //         );
                                                    //     });
                                                }}
                                            >
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 10 10"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M9.78015 3.74654C9.78165 3.59508 9.75299 3.44483 9.69584 3.30456C9.63869 3.16429 9.55419 3.0368 9.44727 2.92951C9.34035 2.82223 9.21314 2.7373 9.07307 2.67967C8.93299 2.62204 8.78285 2.59287 8.63138 2.59386C7.37363 2.59098 6.09489 2.59171 4.85822 2.59251L3.897 2.59302C3.73009 2.5908 3.56495 2.62745 3.41465 2.70006C2.97533 2.91809 2.75118 3.27631 2.74841 3.76477C2.74532 4.31365 2.74599 4.87162 2.74665 5.41122C2.74692 5.64063 2.7471 5.87006 2.74719 6.0995C2.74719 6.3371 2.74706 6.5747 2.74678 6.81231C2.7463 7.35299 2.74579 7.91206 2.74798 8.46203C2.7506 9.12465 3.25256 9.62457 3.9156 9.62494C4.81025 9.62541 5.60594 9.62566 6.34021 9.62566C7.16041 9.62566 7.90392 9.62534 8.62194 9.62475C8.77412 9.62647 8.92513 9.59783 9.06612 9.54052C9.20711 9.48321 9.33527 9.39837 9.4431 9.29096C9.55093 9.18356 9.63628 9.05574 9.69415 8.91497C9.75202 8.77421 9.78126 8.62332 9.78015 8.47113C9.78228 6.90581 9.78229 5.31622 9.78015 3.74654ZM8.8873 4.10982C8.88733 5.54476 8.88722 6.97967 8.88695 8.41457L8.88699 8.43113C8.88862 8.46807 8.88624 8.50509 8.87989 8.54152C8.8674 8.59751 8.83552 8.64727 8.78987 8.682C8.74422 8.71673 8.68776 8.7342 8.63047 8.7313C8.41171 8.73272 8.18908 8.7325 7.97379 8.73221L5.71892 8.73199C5.12413 8.73188 4.52933 8.73205 3.93454 8.7325C3.87242 8.73855 3.80999 8.72462 3.75632 8.69275C3.72211 8.67189 3.69369 8.64277 3.67364 8.60808C3.65359 8.57339 3.64256 8.53422 3.64156 8.49417C3.64054 8.47433 3.64068 8.45446 3.64079 8.43459L3.64085 8.41518L3.64083 8.0634C3.64079 6.64328 3.6409 5.22312 3.64116 3.80295L3.64112 3.78529C3.63949 3.74862 3.64181 3.71188 3.64804 3.6757C3.66047 3.62262 3.69023 3.57518 3.73263 3.5409C3.77502 3.50662 3.82763 3.48744 3.88215 3.4864C3.89632 3.48582 3.91054 3.48571 3.92475 3.48571H3.93896L3.95268 3.48574L4.54527 3.48571C5.8884 3.48571 7.23154 3.48597 8.57469 3.48651C8.62406 3.48482 8.67341 3.49013 8.72129 3.50227C8.76841 3.51726 8.80967 3.5466 8.83929 3.5862C8.86892 3.62579 8.88543 3.67365 8.88651 3.72309C8.8875 3.74373 8.88739 3.7644 8.88731 3.78504L8.88728 3.80233L8.8873 4.10982Z"
                                                        fill="black"
                                                    />
                                                    <path
                                                        d="M2.03842 6.53691L2.00645 6.53495C1.98275 6.53342 1.96078 6.53207 1.93873 6.53185C1.90766 6.5316 1.87662 6.53185 1.84555 6.53218C1.7921 6.53262 1.74162 6.53313 1.6911 6.53083C1.65727 6.53139 1.62367 6.5252 1.59227 6.51263C1.56086 6.50006 1.53227 6.48136 1.50816 6.45762C1.48406 6.43389 1.46493 6.40558 1.45188 6.37437C1.43883 6.34316 1.43213 6.30966 1.43216 6.27583C1.43105 6.25945 1.43127 6.243 1.4314 6.22655L1.43149 6.20769C1.43146 4.67317 1.43147 3.13864 1.43155 1.60412L1.43149 1.58712C1.43094 1.56513 1.43158 1.54313 1.4334 1.52121C1.43649 1.45802 1.4632 1.3983 1.50824 1.35388C1.55327 1.30945 1.61335 1.28357 1.67658 1.28135C1.69714 1.27942 1.71969 1.27974 1.74358 1.27996L1.77024 1.28018C2.17378 1.28073 2.57718 1.2809 2.98043 1.28069C4.07764 1.28142 5.21221 1.28218 6.3282 1.27687C6.46105 1.27723 6.55801 1.30752 6.61645 1.36986C6.66993 1.4269 6.69308 1.51334 6.68522 1.62672C6.68136 1.68252 6.68236 1.73792 6.68333 1.79146C6.68376 1.81541 6.68422 1.83954 6.68422 1.86385C6.68422 1.87609 6.68663 1.88821 6.69131 1.89951C6.69599 1.91082 6.70286 1.92109 6.71151 1.92974C6.72016 1.9384 6.73043 1.94526 6.74174 1.94994C6.75304 1.95462 6.76516 1.95703 6.7774 1.95703H7.47738C7.50209 1.95703 7.52579 1.94721 7.54326 1.92974C7.56074 1.91227 7.57055 1.88857 7.57056 1.86385C7.57056 1.82458 7.57085 1.78585 7.57116 1.74746C7.57183 1.66123 7.57248 1.57981 7.56988 1.49599C7.567 1.34534 7.53336 1.19688 7.471 1.05971C7.40865 0.922551 7.31892 0.799584 7.20731 0.698367C6.9863 0.491301 6.71064 0.390625 6.36461 0.390625H6.3607C5.24835 0.392954 4.11735 0.392627 3.02358 0.392445C2.66452 0.392336 2.30547 0.392274 1.94643 0.392262C1.84175 0.392299 1.73703 0.391024 1.63244 0.394919C1.36618 0.403126 1.11205 0.508155 0.917685 0.690322C0.66847 0.91839 0.542388 1.21798 0.542971 1.58072C0.544699 2.70064 0.544482 3.8393 0.544281 4.94051L0.544135 6.23063C0.544154 6.26284 0.5451 6.29501 0.546338 6.32719C0.55519 6.58275 0.650907 6.82765 0.817692 7.02147C0.984477 7.2153 1.21236 7.34648 1.46374 7.39335C1.59207 7.41178 1.7218 7.41862 1.85136 7.41377C1.90501 7.41333 1.96048 7.41289 2.01345 7.41431C2.01451 7.41435 2.01555 7.41435 2.0166 7.41435C2.04403 7.41379 2.07017 7.40262 2.08954 7.38319C2.10106 7.37451 2.11041 7.36327 2.11684 7.35036C2.12328 7.33745 2.12663 7.32322 2.12663 7.3088V6.62994C2.12663 6.60609 2.11749 6.58315 2.10108 6.56584C2.08467 6.54853 2.06224 6.53817 2.03842 6.53691Z"
                                                        fill="black"
                                                    />
                                                </svg>
                                            </div>
                                            <a
                                                target="_blank"
                                                rel="noreferrer"
                                                href={`https://etherscan.io/address/123`}
                                            >
                                                <img src="/metamask.svg" alt="" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <StakingSummary
                            logo="ZUN"
                            selected={true}
                            baseApy={'16%'}
                            deposit={`$134,980`}
                            tvl={'$1,394,044'}
                            className="mt-3"
                        />
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header section="uzd" />
                        <div className="row ms-md-4">
                            <div className="col-xxl-5 col-xs-12">
                                <div className="card m-xxl-3 mt-xxl-0 h-100">
                                    <div className="card-body p-3">
                                        <div className="title">Info bar</div>
                                        <div className="row mt-3">
                                            <div className="col-6 col-md-6">
                                                <div className="gray-block small-block align-items-start stablecoin mb-3 ps-3 me-3 me-lg-2">
                                                    <div>
                                                        <span className="name">Supply</span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        750 000 ZUN
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-6">
                                                <div className="gray-block small-block align-items-start stablecoin mb-3 ps-3 me-0 me-lg-2">
                                                    <div>
                                                        <span className="name">Locked</span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        750 ZUN (10%)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-6">
                                                <div className="gray-block small-block align-items-start stablecoin mb-3 mb-md-0 ps-3 me-3 me-lg-2">
                                                    <div>
                                                        <span className="name">FDV</span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        $ 10,000,000
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-6">
                                                <div className="gray-block small-block align-items-start stablecoin mb-3 mb-md-0 ps-3 me-0 me-lg-2">
                                                    <div>
                                                        <span className="name">
                                                            Est. yeld / week
                                                        </span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        $20, 000
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Your current ZUN locks */}
                            <div className="col-xxl-7 col-xs-12 d-flex flex-column mt-3 mt-xxl-0">
                                <div className="card">
                                    <div className="card-body p-3">
                                        <div className="title">
                                            <svg
                                                width="16"
                                                height="12"
                                                viewBox="0 0 16 12"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="me-2 zun-icon"
                                            >
                                                <path
                                                    d="M8.56819 12C6.42605 12 4.52269 11.2648 3.04239 9.8604C2.05088 8.91977 1.28621 7.71143 0.769649 6.26901C0.258944 4.84302 0 3.20652 0 1.40498L3.33492 1.40498C3.33492 2.82866 3.52921 4.09304 3.91238 5.16296C4.25318 6.11457 4.73625 6.89139 5.34817 7.47197C6.2631 8.33995 7.437 8.74913 8.83713 8.68811C10.1275 8.63188 11.1231 8.23318 11.7963 7.50307C12.3565 6.89537 12.6651 6.07372 12.6651 5.18951C12.6727 4.6867 12.4834 4.20054 12.1371 3.83317C11.9747 3.66356 11.7787 3.52916 11.5613 3.43844C11.3439 3.34771 11.11 3.30264 10.8742 3.30607C10.5485 3.30849 10.2351 3.4293 9.99333 3.64557C9.76081 3.86157 9.48368 4.30689 9.48368 5.2017L6.14875 5.2017C6.14875 3.12285 6.99931 1.89627 7.71281 1.23336C8.57289 0.443163 9.70152 0.00287752 10.8742 7.37461e-05C11.5601 -0.00362201 12.2395 0.131628 12.8708 0.397527C13.5021 0.663427 14.072 1.05437 14.5455 1.54638C15.4835 2.51718 16 3.81101 16 5.1895C16 6.90124 15.3813 8.51494 14.2579 9.73345C13.3694 10.6972 11.7331 11.8711 8.98353 11.9909C8.84418 11.997 8.70575 12 8.56819 12Z"
                                                    fill="black"
                                                />
                                            </svg>
                                            <span>Your current ZUN locks</span>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-12 col-md-5">
                                                <div className="gray-block small-block align-items-start stablecoin ps-3 me-3 me-lg-2">
                                                    <div>
                                                        <span className="name">
                                                            Already claimed
                                                        </span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">$109</div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-7 mt-3 mt-md-0">
                                                <div>
                                                    <div className="d-flex flex-row justify-content-between gray-block small-block align-items-center stablecoin ps-3 me-3 me-lg-0">
                                                        <div>
                                                            <div>
                                                                <span className="name">
                                                                    Unclaimed
                                                                </span>
                                                            </div>
                                                            <div className="vela-sans value mt-1">
                                                                $100
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <button className="zun-button">
                                                                Claim
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-12 col-md-3">
                                                <div className="h-100 gray-block small-block align-items-start stablecoin ps-3 me-3 me-lg-2">
                                                    <div>
                                                        <span className="name">
                                                            Current vote weight
                                                        </span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">75</div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-9 mt-3 mt-md-0">
                                                <div className="gray-block small-block align-items-start stablecoin ps-3 me-3 me-lg-0">
                                                    <LockHistory
                                                        items={transactionList}
                                                        emptyText="No history"
                                                        className=""
                                                        columns={['ZUN Locked', 'Time remaining']}
                                                        onPageEnd={() => {
                                                            if (transHistoryPage !== -1) {
                                                                setLoadingHistory(true);
                                                                setTransHistoryPage(
                                                                    transHistoryPage + 1
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row ms-md-4">
                            {/* Reward distribution History */}
                            <div className="col-xxl-6 col-xs-12 mt-3 mt-xxl-0 h-md-100">
                                <div className="card m-xxl-3 h-md-100 mt-3">
                                    <div className="card-body">
                                        <div className="title">Lock your ZUNs</div>
                                        <div>
                                            <Input
                                                action="deposit"
                                                name={'ZUN'}
                                                mode={'deposit'}
                                                value={'0'}
                                                handler={(sum) => {}}
                                                max={BIG_ZERO}
                                                onCoinChange={(coin: string) => {}}
                                                chainId={chainId}
                                                className={''}
                                                hideToggler={true}
                                                stakingMode="zunUSD"
                                            />
                                        </div>
                                        <div className="d-flex buttons-row">
                                            <button className="zun-button me-3">Lock</button>
                                            <DirectAction
                                                chainId={chainId}
                                                actionName="lock"
                                                checked={false}
                                                title={'Auto-relock'}
                                                disabled={chainId !== 1}
                                                hint={'Example tooltip text'}
                                                onChange={(state: boolean) => {
                                                    // setLockAndBoost(state);
                                                }}
                                            />
                                            <DirectAction
                                                chainId={chainId}
                                                actionName="recap"
                                                checked={false}
                                                title={'Recapitalization'}
                                                disabled={chainId !== 1}
                                                hint={'Example tooltip text'}
                                                onChange={(state: boolean) => {
                                                    // setLockAndBoost(state);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card m-xxl-3 h-md-100 mt-3">
                                    <div className="card-body">
                                        <div className="title">Reward distribution History</div>
                                        <RebaseHistory
                                            items={transactionList}
                                            emptyText="No history"
                                            className="mt-3 mt-md-3"
                                            columns={['Date', 'Tokens', 'Total in USD']}
                                            onPageEnd={() => {
                                                if (transHistoryPage !== -1) {
                                                    setLoadingHistory(true);
                                                    setTransHistoryPage(transHistoryPage + 1);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-6 col-xs-12 d-flex flex-column mt-xxl-0 apy-bar-card">
                                <div className="card mt-3 h-100">
                                    <div className="card-body pb-0">
                                        <div className="title">APY bar</div>
                                        <div className="mt-3">
                                            <div className="d-flex mt-3 gap-3 me-3">
                                                <div className="gray-block small-block align-items-start stablecoin mb-2 col-6">
                                                    <div>
                                                        <span className="name">Base APY now</span>
                                                    </div>
                                                    {!uzdStatLoading && (
                                                        <div className="vela-sans value mt-1">
                                                            {baseApy}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="gray-block small-block align-items-start stablecoin mb-2 col-6">
                                                    <div className="d-flex">
                                                        <span className="name">Average APY</span>
                                                        <div
                                                            ref={apyHintTarget}
                                                            onClick={() =>
                                                                setShowApyHint(!showApyHint)
                                                            }
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
                                                                    className="ms-2 mb-1"
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
                                                    <div className="vela-sans value">
                                                        {apyBarMonthlyApy}
                                                    </div>
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
                            </div>
                        </div>
                        <SupportersBar section="uzd" className="row" />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
