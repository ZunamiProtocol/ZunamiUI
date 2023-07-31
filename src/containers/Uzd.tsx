import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '../components/Header/Header';
import './Uzd.scss';
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { useWallet } from 'use-wallet';
import useUzdBalance from '../hooks/useUzdBalance';
import useTotalSupply from '../hooks/useTotalSupply';
import useEagerConnect from '../hooks/useEagerConnect';
import { BIG_TEN, getBalanceNumber, UZD_DECIMALS } from '../utils/formatbalance';
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
import { UzdMigrationModal } from '../components/UzdMigrationModal/UzdMigrationModal';
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
    const { account, connect, ethereum, chainId } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);
    const zethBalance = useUzdBalance(contractAddresses.zeth[1]);
    const deprecatedUzdBalance = useUzdBalance(contractAddresses.deprecated.v_1_1_uzd);
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
                    items.data.map((item) => {
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

    // v1.1 migration modal
    const [showMigrationModal, setShowMigrationModal] = useState(false);

    useEffect(() => {
        if (deprecatedUzdBalance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).toNumber() >= 1) {
            setShowMigrationModal(true);
        } else {
            setShowMigrationModal(false);
        }
    }, [deprecatedUzdBalance]);

    const [transactionsType, setTransactionsType] = useState('UZD');
    const [transactionList, setTransactionList] = useState([]);
    const [transHistoryPage, setTransHistoryPage] = useState(0);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!account || transHistoryPage === -1 || loadingHistory) {
            return;
        }

        const getTransactionHistory = async () => {
            try {
                setLoadingHistory(true);

                const url =
                    stakingMode === 'UZD'
                        ? getRebaseHistoryUrl(0, 70)
                        : getZethRebaseHistoryUrl(0, 70);
                let historyResponse = await fetch(url);
                const items = await historyResponse.json();

                if (!items.uzdRebases?.length && !items.zethRebases?.length) {
                    setTransHistoryPage(-1);
                    return;
                }

                if (items.uzdRebases?.length) {
                    items.uzdRebases.forEach((item) => {
                        item.type = 'uzd';
                    });
                }

                if (items.zethRebases?.length) {
                    items.zethRebases.forEach((item) => {
                        item.type = 'zeth';
                    });
                }

                let finalData = [];

                if (transactionsType !== stakingMode) {
                    setTransactionsType(stakingMode);
                } else {
                    finalData = transactionList;
                }

                finalData = finalData.concat(
                    items.uzdRebases ? items.uzdRebases : items.zethRebases
                );

                setTransactionList(
                    finalData.sort((a: iHistoryTransaction, b: iHistoryTransaction | undefined) => {
                        if (!b) {
                            return 0;
                        }

                        return new Date(a.dateTime).getTime() > new Date(b.dateTime).getTime()
                            ? -1
                            : 1;
                    })
                );

                setLoadingHistory(false);
            } catch (error) {
                setTransactionList([]);
                setLoadingHistory(false);
            }
        };

        getTransactionHistory();
    }, [account, transHistoryPage, chainId, stakingMode]);

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

        if (result > 500) {
            result = '500+';
        }
        return `${result}%`;
    }, [stakingMode, uzdStatData]);

    const apyPopover = (
        <Popover
            onMouseEnter={() => setShowApyHint(true)}
            onMouseLeave={() => setShowApyHint(false)}
        >
            <Popover.Body>
                <div className="">
                    <span>Average APY in 30 days: </span>
                    <span className="text-primary">
                        {stakingMode === 'UZD'
                            ? uzdStatLoading || !uzdStatData
                                ? 'n/a'
                                : `${uzdStatData.info.omnipool.monthlyAvgApy.toFixed(2)}%`
                            : uzdStatLoading
                            ? 0
                            : `${uzdStatData.info.zethOmnipool.monthlyAvgApy.toFixed(2)}%`}
                    </span>
                </div>
                <div className="">
                    <span>Average APY in 90 days: </span>
                    <span className="text-primary">
                        {stakingMode === 'UZD'
                            ? uzdStatLoading || !uzdStatData
                                ? 'n/a'
                                : `${uzdStatData.info.omnipool.threeMonthAvgApy.toFixed(2)}%`
                            : uzdStatLoading
                            ? 0
                            : `${uzdStatData.info.zethOmnipool.threeMonthAvgApy.toFixed(2)}%`}
                    </span>
                </div>
            </Popover.Body>
        </Popover>
    );

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
            result = result.toFixed(2);
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
                    <UzdMigrationModal
                        show={showMigrationModal && !hideMigrationModal}
                        balance={deprecatedUzdBalance}
                        onHide={() => {
                            setShowMigrationModal(false);
                            setHideMigrationModal(true);
                        }}
                    />
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
                                href="/zstables"
                                className="text-center d-flex flex-column text-decoration-none selected"
                            >
                                <img src="/uzd.png" alt="" />
                                <span className="text-muted mt-2">UZD & zETH</span>
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
                        <YourData
                            account={account}
                            lpPrice={lpPrice}
                            balances={balances}
                            userMaxWithdraw={getFullDisplayBalance(apsBalance.plus(zethBalance))}
                            totalIncome="$0"
                            dailyProfit={0}
                            monthlyProfit={0}
                            yearlyProfit={0}
                        />
                        <UzdStakingSummary
                            logo="UZD"
                            selected={stakingMode === 'UZD'}
                            baseApy={
                                !uzdStatLoading ? uzdStatData.info.omnipool.apy.toFixed(2) : '-'
                            }
                            deposit={formatUzd(uzdBalance)}
                            className="mt-3"
                            onSelect={() => {
                                setStakingMode('UZD');
                            }}
                        />
                        <UzdStakingSummary
                            logo="ZETH"
                            selected={stakingMode === 'ZETH'}
                            baseApy={
                                !uzdStatLoading
                                    ? formatPoolApy(uzdStatData.info.zethOmnipool.apy)
                                    : '-'
                            }
                            deposit={formatUzd(zethBalance)}
                            className="mt-3"
                            onSelect={() => {
                                setStakingMode('ZETH');
                            }}
                        />
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header section="uzd" />
                        <div className="row ms-md-4">
                            <div className="col-xxl-7 col-xs-12">
                                <div className="card m-xxl-3 mt-xxl-0">
                                    <div className="card-body p-3">
                                        <div className="title">Info bar</div>
                                        <div className="row mt-3">
                                            <div className="col-6 col-md-4">
                                                <div className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 ps-3 me-3 me-lg-2">
                                                    <div>
                                                        <span className="name">
                                                            Total Circulating
                                                        </span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        {stakingMode === 'UZD' ? '$' : ''}
                                                        {Number(
                                                            getFullDisplayBalance(
                                                                stakingMode === 'UZD'
                                                                    ? uzdTotalSupply
                                                                    : zethTotalSupply
                                                            )
                                                        ).toLocaleString('en', {
                                                            maximumFractionDigits: 0,
                                                        })}
                                                        {stakingMode !== 'UZD' ? ' ETH' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-4">
                                                <div className="gray-block small-block align-items-start stablecoin mb-3 mb-md-0 ps-3 me-0 me-lg-2">
                                                    <div>
                                                        <span className="name">Collateral</span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">
                                                        {stakingMode === 'UZD' ? '$' : ''}
                                                        {uzdStatData
                                                            ? `${Number(
                                                                  getBalanceNumber(
                                                                      stakingMode === 'UZD'
                                                                          ? uzdStatData.info
                                                                                .omnipool.tvl
                                                                          : uzdStatData.info
                                                                                .zethOmnipool.tvl
                                                                  )
                                                              ).toLocaleString('en', {
                                                                  maximumFractionDigits: 2,
                                                              })}`
                                                            : 'n/a'}
                                                        {stakingMode !== 'UZD' ? ' ETH' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 ps-3">
                                                    <div>
                                                        <span className="name">
                                                            Contract address
                                                        </span>
                                                    </div>
                                                    <div className="value mt-1 d-flex">
                                                        <a
                                                            href={`https://etherscan.io/address/${
                                                                stakingMode === 'UZD'
                                                                    ? contractAddresses.uzd[1]
                                                                    : contractAddresses.zeth[1]
                                                            }`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="d-flex align-items-center text-black"
                                                        >
                                                            <svg
                                                                width="13"
                                                                height="13"
                                                                viewBox="0 0 13 13"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="me-1 link-icon"
                                                            >
                                                                <path
                                                                    d="M8.29475 5.74391C8.11403 5.93511 7.95744 6.13257 7.76908 6.29267C7.48083 6.53769 7.05959 6.50603 6.77493 6.23894C6.56704 6.04387 6.33233 5.90221 6.05279 5.83982C5.4991 5.71623 5.0125 5.84624 4.60887 6.2449C3.95652 6.88922 3.3112 7.54066 2.66289 8.18907C2.43882 8.41318 2.21232 8.63492 1.9911 8.8618C1.57658 9.28691 1.43185 9.79315 1.59453 10.3637C1.75747 10.9352 2.14735 11.2948 2.72735 11.4241C3.25105 11.5407 3.71523 11.3996 4.10432 11.0313C4.33441 10.8136 4.55389 10.5846 4.77801 10.3605C5.12464 10.014 5.47147 9.66764 5.81718 9.32017C5.84682 9.29038 5.8687 9.25286 5.89755 9.21444C6.53377 9.45776 7.17371 9.52066 7.85641 9.43314C7.81496 9.48238 7.79378 9.51164 7.76857 9.53687C6.91429 10.3916 6.06228 11.2487 5.20414 12.0996C4.55322 12.745 3.76191 13.0363 2.84886 12.9903C1.47935 12.9214 0.276548 11.8487 0.0503072 10.4948C-0.121376 9.46743 0.144843 8.56375 0.87241 7.81854C1.75788 6.9116 2.65648 6.01718 3.56198 5.13018C4.24886 4.45733 5.08631 4.17686 6.04072 4.28964C6.99286 4.40215 7.74262 4.85631 8.25748 5.67667C8.2687 5.69455 8.27971 5.71259 8.28999 5.73103C8.294 5.73821 8.29571 5.74667 8.29475 5.74391Z"
                                                                    fill="black"
                                                                />
                                                                <path
                                                                    d="M7.09444 3.77629C6.45425 3.53457 5.81886 3.46741 5.13565 3.55984C5.18259 3.50805 5.20839 3.47705 5.23678 3.44864C6.07612 2.6089 6.91744 1.77113 7.75461 0.929244C8.23818 0.442938 8.81458 0.138843 9.49144 0.0351505C10.9936 -0.194974 12.449 0.725572 12.8644 2.18897C13.1797 3.29997 12.9466 4.30867 12.1493 5.14459C11.2747 6.06158 10.3671 6.9474 9.4647 7.83753C8.78847 8.50459 7.96712 8.80235 7.01996 8.70843C6.04059 8.61132 5.2706 8.15509 4.74039 7.31504C4.72689 7.29364 4.71424 7.27163 4.70246 7.24924C4.69879 7.24226 4.69931 7.23307 4.69922 7.23253C4.87 7.05681 5.02759 6.87299 5.20748 6.7145C5.49621 6.46011 5.92889 6.48049 6.22305 6.75314C6.39956 6.91673 6.59297 7.04949 6.82331 7.11844C7.40462 7.29244 7.93453 7.19194 8.37025 6.76371C9.25916 5.89006 10.1395 5.00758 11.0149 4.12034C11.4276 3.70207 11.5598 3.19146 11.3947 2.6265C11.2279 2.05591 10.838 1.69669 10.257 1.57155C9.72799 1.4576 9.25887 1.60231 8.87322 1.98161C8.30692 2.53859 7.74836 3.10346 7.18713 3.66559C7.15445 3.69832 7.12738 3.73664 7.09444 3.77629Z"
                                                                    fill="black"
                                                                />
                                                            </svg>
                                                            <span>Link</span>
                                                        </a>
                                                        <div className="buttons position-static m-0 ms-2 p-0 contract-buttons">
                                                            <div
                                                                onClick={async () => {
                                                                    navigator.clipboard
                                                                        .writeText(
                                                                            stakingMode === 'UZD'
                                                                                ? contractAddresses
                                                                                      .uzd[1]
                                                                                : contractAddresses
                                                                                      .zeth[1]
                                                                        )
                                                                        .then(function () {
                                                                            alert(
                                                                                'Address copied to the clipboard'
                                                                            );
                                                                        });
                                                                }}
                                                            >
                                                                <svg
                                                                    width="13"
                                                                    height="12"
                                                                    viewBox="0 0 13 12"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M12.4983 4.3615C12.5002 4.16476 12.463 3.9696 12.3888 3.78739C12.3145 3.60519 12.2048 3.43958 12.0659 3.30022C11.927 3.16086 11.7618 3.05054 11.5798 2.97568C11.3979 2.90083 11.2028 2.86294 11.0061 2.86422C9.37233 2.86048 7.7113 2.86143 6.10492 2.86247L4.85633 2.86313C4.63953 2.86025 4.42502 2.90785 4.22979 3.00218C3.65913 3.28538 3.36796 3.7507 3.36437 4.38518C3.36035 5.09815 3.36123 5.82294 3.36208 6.52385C3.36243 6.82185 3.36267 7.11987 3.36279 7.4179C3.36279 7.72653 3.36261 8.03517 3.36224 8.34381C3.36163 9.04614 3.36097 9.77235 3.3638 10.4867C3.36721 11.3474 4.01923 11.9968 4.88049 11.9973C6.04261 11.9979 7.07618 11.9982 8.02996 11.9982C9.09537 11.9982 10.0612 11.9978 10.9938 11.9971C11.1915 11.9993 11.3877 11.9621 11.5708 11.8876C11.754 11.8132 11.9204 11.703 12.0605 11.5635C12.2006 11.424 12.3114 11.2579 12.3866 11.0751C12.4618 10.8922 12.4997 10.6962 12.4983 10.4986C12.5011 8.46527 12.5011 6.40045 12.4983 4.3615ZM11.3385 4.83339C11.3386 6.69732 11.3384 8.56121 11.3381 10.4251L11.3381 10.4466C11.3402 10.4946 11.3372 10.5427 11.3289 10.59C11.3127 10.6627 11.2713 10.7273 11.212 10.7725C11.1527 10.8176 11.0793 10.8403 11.0049 10.8365C10.7208 10.8383 10.4316 10.8381 10.1519 10.8377L7.22293 10.8374C6.45032 10.8373 5.67771 10.8375 4.9051 10.8381C4.82441 10.8459 4.74331 10.8278 4.6736 10.7864C4.62917 10.7593 4.59224 10.7215 4.5662 10.6764C4.54016 10.6314 4.52583 10.5805 4.52453 10.5285C4.52321 10.5027 4.52339 10.4769 4.52354 10.4511L4.52361 10.4259L4.52358 9.96893C4.52354 8.12424 4.52368 6.27953 4.52401 4.43478L4.52396 4.41185C4.52184 4.36421 4.52486 4.31648 4.53294 4.26949C4.54909 4.20053 4.58775 4.13892 4.64282 4.09439C4.6979 4.04986 4.76623 4.02495 4.83704 4.02359C4.85546 4.02283 4.87392 4.02269 4.89238 4.02269H4.91085L4.92867 4.02274L5.69842 4.02269C7.44309 4.02269 9.18777 4.02304 10.9325 4.02373C10.9966 4.02154 11.0607 4.02843 11.1229 4.0442C11.1841 4.06368 11.2377 4.1018 11.2762 4.15323C11.3147 4.20466 11.3361 4.26683 11.3375 4.33105C11.3388 4.35785 11.3386 4.38471 11.3385 4.41151L11.3385 4.43397L11.3385 4.83339Z"
                                                                        fill="#000000"
                                                                    />
                                                                    <path
                                                                        d="M2.44244 7.98377L2.4009 7.98122C2.37013 7.97923 2.34159 7.97748 2.31294 7.9772C2.27259 7.97687 2.23226 7.9772 2.19191 7.97762C2.12248 7.97819 2.0569 7.97885 1.99128 7.97587C1.94734 7.97659 1.9037 7.96856 1.8629 7.95223C1.8221 7.9359 1.78497 7.91161 1.75366 7.88078C1.72235 7.84994 1.69749 7.81318 1.68054 7.77264C1.66359 7.73209 1.65489 7.68858 1.65494 7.64464C1.65349 7.62336 1.65378 7.60199 1.65394 7.58062L1.65406 7.55613C1.65402 5.56285 1.65404 3.56956 1.65413 1.57628L1.65406 1.5542C1.65334 1.52564 1.65417 1.49705 1.65654 1.46858C1.66056 1.3865 1.69525 1.30893 1.75375 1.25122C1.81225 1.19352 1.89029 1.15989 1.97242 1.15701C1.99913 1.1545 2.02842 1.15493 2.05946 1.15521L2.09409 1.1555C2.61827 1.15621 3.14226 1.15643 3.66607 1.15616C5.0913 1.1571 6.56505 1.15809 8.01468 1.15119C8.18725 1.15167 8.3132 1.191 8.3891 1.27199C8.45858 1.34608 8.48865 1.45837 8.47844 1.60564C8.47342 1.67812 8.47472 1.75008 8.47598 1.81962C8.47654 1.85073 8.47714 1.88208 8.47714 1.91366C8.47714 1.92956 8.48026 1.9453 8.48635 1.95998C8.49243 1.97467 8.50134 1.98801 8.51258 1.99925C8.52382 2.01049 8.53717 2.0194 8.55185 2.02549C8.56653 2.03157 8.58228 2.0347 8.59817 2.0347H9.50742C9.53952 2.0347 9.5703 2.02194 9.593 1.99925C9.6157 1.97655 9.62845 1.94576 9.62845 1.91366C9.62845 1.86265 9.62883 1.81234 9.62923 1.76247C9.63011 1.65046 9.63096 1.5447 9.62758 1.43582C9.62384 1.24014 9.58013 1.04729 9.49914 0.86912C9.41815 0.69095 9.30158 0.53122 9.15661 0.399744C8.86953 0.130773 8.51146 0 8.06198 0H8.0569C6.612 0.00302586 5.14288 0.00260021 3.72212 0.00236395C3.25571 0.00222226 2.78932 0.00214222 2.32294 0.00212608C2.18697 0.00217449 2.05095 0.000518698 1.91509 0.00557745C1.56923 0.016238 1.23912 0.152667 0.986649 0.389294C0.662929 0.685545 0.499154 1.0747 0.499911 1.54588C0.502156 3.00061 0.501874 4.47969 0.501613 5.91011L0.501424 7.58592C0.501448 7.62776 0.502677 7.66956 0.504284 7.71135C0.515783 8.04331 0.640116 8.36142 0.856763 8.6132C1.07341 8.86497 1.36942 9.03536 1.69595 9.09624C1.86265 9.12019 2.03116 9.12907 2.19945 9.12277C2.26914 9.1222 2.34119 9.12163 2.41001 9.12348C2.41138 9.12353 2.41272 9.12353 2.4141 9.12353C2.44972 9.1228 2.48368 9.1083 2.50884 9.08305C2.5238 9.07178 2.53594 9.05718 2.5443 9.04041C2.55266 9.02364 2.55702 9.00515 2.55702 8.98642V8.10462C2.55702 8.07363 2.54515 8.04383 2.52383 8.02134C2.50251 7.99886 2.47338 7.98541 2.44244 7.98377Z"
                                                                        fill="#000000"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <div
                                                                onClick={async () => {
                                                                    addToken(
                                                                        ethereum,
                                                                        stakingMode === 'UZD'
                                                                            ? 'UZD'
                                                                            : 'ZETH',
                                                                        UZD_DECIMALS,
                                                                        stakingMode === 'UZD'
                                                                            ? 'https://app.zunami.io/uzd-token.png'
                                                                            : 'https://app.zunami.io/eth-zlp-coin.svg'
                                                                    );
                                                                }}
                                                            >
                                                                <img
                                                                    src="/metamask-icon.svg"
                                                                    alt="Add token to Metamask"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-5 col-xs-12 d-flex flex-column mt-3 mt-xxl-0">
                                <div className="card buy-uzd">
                                    <div className="card-body p-3">
                                        <svg
                                            width="134"
                                            height="154"
                                            viewBox="0 0 134 154"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="bg"
                                        >
                                            <path
                                                d="M133.304 96.2632L129.728 89.5694C129.356 88.8749 128.849 88.2597 128.236 87.7589C127.623 87.2582 126.916 86.8818 126.156 86.6514C125.396 86.4174 124.597 86.3339 123.804 86.4056C123.011 86.4773 122.241 86.7029 121.537 87.0694L88.2068 104.421L72.3009 74.6446L97.2053 15.3472C97.6018 14.4109 97.744 13.3887 97.6178 12.3815C97.5784 11.508 97.3446 10.6538 96.933 9.87965L93.3577 3.18767C92.9866 2.49309 92.4801 1.87778 91.8673 1.37713C91.2545 0.876489 90.5475 0.500399 89.7869 0.270492C89.027 0.0367034 88.2276 -0.046732 87.435 0.0248464C86.6424 0.0964248 85.8722 0.321606 85.1679 0.687617L44.1891 22.0212L35.9183 6.53906C35.547 5.84456 35.0402 5.22928 34.4275 4.72852C33.8147 4.22776 33.108 3.85138 32.3475 3.62098C31.5877 3.38613 30.7884 3.30224 29.9956 3.37398C29.2028 3.44573 28.4323 3.6717 27.7285 4.039L20.9494 7.56749C20.2458 7.9342 19.6225 8.43441 19.1153 9.03945C18.608 9.64449 18.2267 10.3424 17.9933 11.0933C17.7562 11.8433 17.6713 12.6322 17.7438 13.4147C17.8163 14.1971 18.0448 14.9577 18.4159 15.6529L26.6867 31.1324L3.23025 43.3432C2.52673 43.7093 1.90329 44.2092 1.39614 44.814C0.888984 45.4188 0.508112 46.1165 0.275088 46.8671C0.0375425 47.6173 -0.0474112 48.4064 0.0251063 49.1891C0.0976239 49.9718 0.326186 50.7325 0.697645 51.4277L4.27298 58.1196C4.64401 58.8142 5.1505 59.4295 5.76331 59.9302C6.37612 60.4308 7.08316 60.8069 7.84376 61.0368C8.60359 61.2708 9.4025 61.3545 10.1951 61.2829C10.9878 61.2113 11.7585 60.9859 12.4627 60.6197L35.9164 48.4098L50.4627 75.6398L24.246 138.061C23.9022 138.919 23.7515 139.841 23.8044 140.762C23.8601 141.684 24.1183 142.583 24.5611 143.397C24.6477 143.555 24.7141 143.683 24.7824 143.815L28.5181 150.812C28.889 151.507 29.3953 152.122 30.0079 152.623C30.6206 153.123 31.3275 153.499 32.0879 153.729C32.6718 153.909 33.2797 154 33.8911 154C34.8725 153.999 35.8391 153.763 36.7078 153.312L79.9351 130.808L84.9448 140.186C85.3158 140.881 85.8223 141.496 86.4351 141.997C87.0479 142.498 87.755 142.874 88.5156 143.104C89.2754 143.338 90.0743 143.421 90.867 143.35C91.6596 143.278 92.4303 143.053 93.1345 142.686L99.9146 139.157C100.618 138.79 101.241 138.29 101.748 137.685C102.255 137.08 102.636 136.383 102.869 135.632C103.106 134.882 103.19 134.093 103.118 133.311C103.045 132.528 102.817 131.768 102.446 131.072L97.4375 121.697L130.769 104.346C131.473 103.979 132.096 103.479 132.603 102.875C133.111 102.27 133.492 101.572 133.725 100.821C133.962 100.071 134.047 99.2828 133.975 98.5007C133.903 97.7185 133.674 96.9582 133.304 96.2632ZM53.4188 39.2987L69.1691 31.1L60.309 52.1954L53.4188 39.2987ZM70.7054 113.532L51.8461 123.348L62.4546 98.0882L70.7054 113.532Z"
                                                fill="url(#paint0_linear_189_241491)"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_189_241491"
                                                    x1="17.6316"
                                                    y1="8.40805"
                                                    x2="101.757"
                                                    y2="104.551"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="white" stopOpacity="0.35" />
                                                    <stop
                                                        offset="0.692708"
                                                        stopColor="white"
                                                        stopOpacity="0"
                                                    />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {stakingMode === 'UZD' && (
                                            <div className="title">
                                                <svg
                                                    width="22"
                                                    height="23"
                                                    viewBox="0 0 22 23"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="me-2"
                                                >
                                                    <circle cx="11" cy="11.5" r="11" fill="white" />
                                                    <path
                                                        d="M17.3021 13.238L16.9621 12.6341C16.9268 12.5714 16.8787 12.5159 16.8204 12.4707C16.7621 12.4255 16.695 12.3916 16.6227 12.3708C16.5504 12.3497 16.4745 12.3421 16.3991 12.3486C16.3238 12.3551 16.2505 12.3754 16.1836 12.4085L13.0156 13.974L11.5037 11.2875L13.8709 5.93732C13.9086 5.85285 13.9221 5.76061 13.9101 5.66974C13.9063 5.59093 13.8841 5.51386 13.845 5.44401L13.5052 4.84022C13.4699 4.77755 13.4217 4.72204 13.3635 4.67686C13.3052 4.63169 13.238 4.59776 13.1657 4.57702C13.0935 4.55592 13.0175 4.5484 12.9422 4.55485C12.8669 4.56131 12.7937 4.58163 12.7267 4.61465L8.83163 6.53949L8.04548 5.1426C8.01019 5.07994 7.96202 5.02443 7.90378 4.97925C7.84553 4.93406 7.77836 4.9001 7.70607 4.87932C7.63386 4.85813 7.55788 4.85056 7.48253 4.85703C7.40717 4.86351 7.33393 4.88389 7.26703 4.91703L6.62267 5.23539C6.5558 5.26848 6.49655 5.31361 6.44834 5.3682C6.40012 5.42279 6.36388 5.48577 6.34169 5.55351C6.31916 5.62118 6.31108 5.69236 6.31797 5.76296C6.32487 5.83355 6.34659 5.90218 6.38186 5.9649L7.16801 7.36155L4.93845 8.46327C4.87158 8.49631 4.81232 8.54141 4.76411 8.59598C4.71591 8.65055 4.67971 8.7135 4.65756 8.78123C4.63498 8.84891 4.6269 8.92011 4.6338 8.99073C4.64069 9.06134 4.66241 9.12998 4.69772 9.1927L5.03756 9.79649C5.07283 9.85916 5.12097 9.91468 5.17922 9.95985C5.23747 10.005 5.30467 10.039 5.37697 10.0597C5.44919 10.0808 5.52513 10.0884 5.60047 10.0819C5.67581 10.0754 5.74907 10.0551 5.81601 10.0221L8.0453 8.92041L9.42795 11.3773L6.93602 17.0093C6.90334 17.0867 6.88902 17.1698 6.89404 17.2529C6.89933 17.3361 6.92388 17.4173 6.96597 17.4907C6.97419 17.5049 6.98051 17.5165 6.98701 17.5284L7.34208 18.1597C7.37734 18.2224 7.42546 18.2779 7.48369 18.3231C7.54193 18.3682 7.60912 18.4022 7.6814 18.4229C7.73689 18.4391 7.79468 18.4473 7.85279 18.4473C7.94608 18.4473 8.03795 18.426 8.12053 18.3853L12.2293 16.3549L12.7055 17.201C12.7408 17.2637 12.7889 17.3192 12.8472 17.3644C12.9054 17.4095 12.9726 17.4435 13.0449 17.4642C13.1171 17.4853 13.1931 17.4929 13.2684 17.4864C13.3438 17.48 13.417 17.4596 13.4839 17.4266L14.1284 17.1081C14.1952 17.075 14.2545 17.0299 14.3026 16.9753C14.3508 16.9208 14.387 16.8578 14.4092 16.7901C14.4317 16.7224 14.4398 16.6512 14.4329 16.5806C14.426 16.5101 14.4043 16.4414 14.369 16.3787L13.8929 15.5328L17.0612 13.9673C17.128 13.9342 17.1873 13.8891 17.2355 13.8345C17.2837 13.7799 17.32 13.717 17.3422 13.6492C17.3647 13.5816 17.3727 13.5105 17.3659 13.4399C17.359 13.3693 17.3373 13.3007 17.3021 13.238ZM9.70892 8.09836L11.206 7.35863L10.3638 9.26197L9.70892 8.09836ZM11.352 14.7961L9.55943 15.6818L10.5678 13.4027L11.352 14.7961Z"
                                                        fill="#FB7303"
                                                    />
                                                </svg>
                                                <span>Buy UZD on</span>
                                            </div>
                                        )}
                                        {stakingMode === 'ZETH' && (
                                            <div className="title">
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="me-2"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M11 22C17.0751 22 22 17.0751 22 11C22 4.92487 17.0751 0 11 0C4.92487 0 0 4.92487 0 11C0 17.0751 4.92487 22 11 22ZM10.282 18.8223C10.4727 18.9408 10.6865 19 10.9004 19C11.1144 19 11.3282 18.9408 11.5189 18.8223L17.6679 15.0022C17.8901 14.8642 18.0238 14.6035 17.9965 14.3337C17.9353 13.7308 17.3515 13.4712 16.9242 13.7362L11.3261 17.2141C11.0636 17.3772 10.7375 17.3772 10.475 17.2142L6.00953 14.4401C5.72383 14.2626 5.63058 13.8744 5.80189 13.5756L10.5688 5.26266C10.7194 5.00007 11.0817 5.00007 11.2323 5.26267L11.6844 6.05117C11.9403 6.4978 12.5719 6.55971 12.8984 6.06051C13.0444 5.83719 13.0446 5.54127 12.9115 5.30918L11.9416 3.61785C11.7952 3.3625 11.5727 3.15726 11.3024 3.06684C10.7241 2.87342 10.1495 3.1127 9.85946 3.61797L4.17479 13.5318C4.00618 13.8258 3.95761 14.171 4.03757 14.5037C4.11733 14.8365 4.31616 15.1159 4.59731 15.2907L10.282 18.8223ZM16.2415 12.0339L11.9958 14.7963C11.8812 14.8708 11.7521 14.9076 11.6236 14.9076C11.4183 14.9076 11.2143 14.814 11.0719 14.6308C10.9108 14.4234 10.8821 14.1342 10.9678 13.882L12.1083 10.5254C12.181 10.3115 11.9596 10.119 11.7733 10.2342L10.5669 10.98C10.1893 11.2139 9.68821 11.0363 9.53644 10.5748C9.42607 10.2392 9.57436 9.86805 9.86559 9.68799L13.2864 7.57307C13.5979 7.38029 14.0073 7.46206 14.2283 7.79118C14.3631 7.99208 14.3825 8.25522 14.3039 8.48675L13.1919 11.7594C13.1183 11.976 13.3454 12.1689 13.5314 12.0479L15.4809 10.7794C15.768 10.5926 16.1494 10.6276 16.3804 10.8865C16.6983 11.2426 16.6147 11.791 16.2415 12.0339Z"
                                                        fill="white"
                                                    />
                                                </svg>
                                                <span>Buy zETH on</span>
                                            </div>
                                        )}
                                        {stakingMode === 'UZD' && (
                                            <div className="d-flex mt-3 gap-3 me-3">
                                                <a
                                                    className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 col-6 bg-white"
                                                    href="https://curve.fi/#/ethereum/pools/factory-v2-284/deposit"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <div>
                                                        <img
                                                            src="/curve-icon.svg"
                                                            alt=""
                                                            className="me-2"
                                                        />
                                                        <span className="name">Curve</span>
                                                    </div>
                                                    <div className="value mt-1">
                                                        UZD / FRAXBP Pool
                                                    </div>
                                                    <svg
                                                        width="8"
                                                        height="8"
                                                        viewBox="0 0 8 8"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="external-icon"
                                                    >
                                                        <path
                                                            d="M0.799805 1H6.7998V7"
                                                            stroke="#959595"
                                                        />
                                                        <path
                                                            d="M6.79901 1L1.00488 6.79545"
                                                            stroke="#959595"
                                                        />
                                                    </svg>
                                                </a>
                                                <a
                                                    className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 col-6 bg-white"
                                                    href="https://app.balancer.fi/#/ethereum/pool/0xec3626fee40ef95e7c0cbb1d495c8b67b34d398300000000000000000000053d"
                                                    target="_"
                                                    rel="noreferrer"
                                                >
                                                    <div>
                                                        <img
                                                            src="/balancer.svg"
                                                            alt=""
                                                            className="me-2"
                                                        />
                                                        <span className="name">Balancer</span>
                                                    </div>
                                                    <div className="value mt-1">UZD/bb-a-USD</div>
                                                    <svg
                                                        width="8"
                                                        height="8"
                                                        viewBox="0 0 8 8"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="external-icon"
                                                    >
                                                        <path
                                                            d="M0.799805 1H6.7998V7"
                                                            stroke="#959595"
                                                        />
                                                        <path
                                                            d="M6.79901 1L1.00488 6.79545"
                                                            stroke="#959595"
                                                        />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                        {stakingMode === 'ZETH' && (
                                            <div className="d-flex mt-3 gap-3 me-3">
                                                <a
                                                    className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 col-6 bg-white"
                                                    href="https://curve.fi/#/ethereum/pools/factory-v2-318/deposit"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <div>
                                                        <img
                                                            src="/curve-icon.svg"
                                                            alt=""
                                                            className="me-2"
                                                        />
                                                        <span className="name">Curve</span>
                                                    </div>
                                                    <div className="value mt-1">zETH / frxETH</div>
                                                    <svg
                                                        width="8"
                                                        height="8"
                                                        viewBox="0 0 8 8"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="external-icon"
                                                    >
                                                        <path
                                                            d="M0.799805 1H6.7998V7"
                                                            stroke="#959595"
                                                        />
                                                        <path
                                                            d="M6.79901 1L1.00488 6.79545"
                                                            stroke="#959595"
                                                        />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row ms-md-4">
                            <div className="col-xxl-6 col-xs-12 mt-3 mt-xxl-0 h-md-100">
                                <div className="card m-xxl-3 mt-xxl-0 h-100">
                                    <div className="card-body pb-0">
                                        <div className="title">APY bar</div>
                                        <div className="mt-3">
                                            <div className="stake-and-boost rounded-4 d-flex">
                                                <div className="col-6 pt-3 pb-3 ps-4">
                                                    <div className="text-white">
                                                        Stake and Boost
                                                    </div>
                                                    <div className="text-white d-flex align-items-center">
                                                        APY to{' '}
                                                        {!uzdStatLoading
                                                            ? uzdStatData.info[
                                                                  stakingMode === 'UZD'
                                                                      ? 'aps'
                                                                      : 'zethAps'
                                                              ].apy.toFixed(2)
                                                            : '0'}
                                                        % !
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip>
                                                                    You can stake {stakingMode} and
                                                                    earn higher yields by providing
                                                                    liquidity to the most profitable
                                                                    {stakingMode} pools. With{' '}
                                                                    {stakingMode}
                                                                    &nbsp;Staking (APS), your
                                                                    liquidity provision rewards will
                                                                    be automatically reinvested.
                                                                </Tooltip>
                                                            }
                                                            trigger={['hover', 'focus']}
                                                        >
                                                            <div className="hint">
                                                                <svg
                                                                    width="13"
                                                                    height="13"
                                                                    viewBox="0 0 13 13"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="ms-1 mb-1"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        clipRule="evenodd"
                                                                        d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM5.355 7.7464H6.49705C6.57884 7.40033 6.67637 7.15808 6.78963 7.01965C6.91548 6.86234 7.24268 6.60751 7.77122 6.25514C8.43191 5.82098 8.81573 5.3522 8.9227 4.84882C9.06742 4.23219 8.95102 3.75712 8.57348 3.42363C8.18966 3.09014 7.64852 2.9234 6.95009 2.9234C6.18243 2.9234 5.57523 3.10273 5.12848 3.46139C4.68803 3.82004 4.39229 4.3832 4.24128 5.15085H5.43995C5.54692 4.72298 5.70737 4.41466 5.92131 4.22589C6.14153 4.03713 6.44041 3.94274 6.81795 3.94274C7.49751 3.94274 7.77437 4.23848 7.64852 4.82995C7.61077 4.99984 7.52268 5.154 7.38425 5.29243C7.25211 5.43086 7.03818 5.59131 6.74244 5.77378C6.34603 6.0066 6.03457 6.27402 5.80804 6.57604C5.60669 6.83403 5.45568 7.22414 5.355 7.7464ZM4.83589 9.79452H6.21389L6.50648 8.44484H5.11904L4.83589 9.79452Z"
                                                                        fill="#ffffff"
                                                                    ></path>
                                                                </svg>
                                                            </div>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                                <div className="col-6 d-flex align-items-center pe-3 ps-3 justify-content-end">
                                                    <Link to="/">
                                                        <button className="zun-button w-100">
                                                            Stake
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
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
                            <div className="col-xxl-6 col-xs-12 d-flex flex-column mt-3 mt-xxl-0">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="title">
                                            {stakingMode === 'UZD' && 'UZD collateral'}
                                            {stakingMode !== 'UZD' && 'zETH collateral'}
                                        </div>
                                        <Chart
                                            data={chartData || []}
                                            className="flex-grow-1 mt-3 mt-xxl-0"
                                            orientation="column"
                                        />
                                    </div>
                                </div>
                                <div className="card mt-3 mb-3 mb-xxl-0 flex-fill">
                                    <div className="card-body">
                                        <div className="title">
                                            {stakingMode === 'UZD' ? 'UZD' : 'zETH'} Rebase History
                                        </div>
                                        <RebaseHistory
                                            items={transactionList}
                                            emptyText="No rebase history"
                                            className="mt-3 mt-md-2"
                                            type={stakingMode === 'UZD' ? 'ZLP' : 'zETH'}
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
                        </div>
                        <SupportersBar section="uzd" className="row" />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
