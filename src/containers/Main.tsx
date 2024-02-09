import React, { useEffect, useState, Suspense, lazy, useRef, useMemo } from 'react';
import './Main.scss';
import { BIG_ZERO, getBalanceNumber } from '../utils/formatbalance';
import useFetch from 'react-fetch-hook';
import {
    getZunEthStratsUrl,
    uzdStakingInfoUrl,
    getZunUsdStratsUrl,
    getZunUsdHistoricalApyUrl,
    getZunEthHistoricalApyUrl,
} from '../api/api';
import { formatPoolApy, poolDataToChartData } from '../functions/pools';
import { Preloader } from '../components/Preloader/Preloader';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import { log, copyLogs } from '../utils/logger';
import { FastDepositForm } from '../components/FastDepositForm/FastDepositForm';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SupportersBar } from '../components/SupportersBar/SupportersBar';
import { StakingSummary } from '../components/StakingSummary/StakingSummary';
import { DashboardCarousel } from '../components/DashboardCarousel/DashboardCarousel';
import { ZunamiInfoFetch, PoolsStats } from './Main.types';
import { ApyDetailsModal } from '../components/ApyDetailsModal/ApyDetailsModal';
import { useAccount, useNetwork } from 'wagmi';
import type { DataItem } from '../components/Chart/Chart';
import { MicroCard } from '../components/MicroCard/MicroCard';
import useBalanceOf from '../hooks/useBalanceOf';
import { getZunUsdAddress, getZunUsdApsAddress } from '../utils/zunami';
import { erc20ABI } from 'wagmi';
import { renderMobileMenu } from '../components/Header/NavMenu/NavMenu';
import { SidebarTopButtons } from '../components/SidebarTopButtons/SidebarTopButtons';

const Header = lazy(() =>
    import('../components/Header/Header').then((module) => ({ default: module.Header }))
);

const MobileSidebar = lazy(() =>
    import('../components/SideBar/MobileSidebar/MobileSidebar').then((module) => ({
        default: module.MobileSidebar,
    }))
);

const SideBar = lazy(() =>
    import('../components/SideBar/SideBar').then((module) => ({ default: module.SideBar }))
);

const ApyChart = lazy(() =>
    import('../components/ApyChart/ApyChart').then((module) => ({ default: module.ApyChart }))
);

const Chart = lazy(() =>
    import('../components/Chart/Chart').then((module) => ({ default: module.Chart }))
);

export const Main = (): JSX.Element => {
    useEffect(() => {
        log(`🏁 Session started ${new Date().toString()}`);
    }, []);

    const { address: account } = useAccount();
    const { chain } = useNetwork();
    const chainId: number = chain ? chain.id : 1;
    const [showApyDetailsModal, setShowApyDetailsModal] = useState(false);
    const apyHintTarget = useRef(null);
    const [showApyHint, setShowApyHint] = useState(false);
    const [stakingMode, setStakingMode] = useState('UZD');
    const [tvl, setTvl] = useState('0');
    const [histApyPeriod, setHistApyPeriod] = useState('week');
    const [histApyData, setHistApyData] = useState([]);
    const [clickCounter, setClickCounter] = useState(0);

    const dailyProfit = Number(0);
    const monthlyProfit = Number(0);
    const yearlyProfit = Number(0);

    // APS balance
    const apsBalance = useBalanceOf(getZunUsdApsAddress(chainId), erc20ABI);

    const { isLoading: uzdStatLoading, data: uzdStatData } = useFetch(
        uzdStakingInfoUrl
    ) as ZunamiInfoFetch;

    const { data: activeStratsStat } = useFetch(
        stakingMode === 'ZETH' ? getZunEthStratsUrl() : getZunUsdStratsUrl()
    );
    const poolStats = activeStratsStat as PoolsStats;

    // APY pools list
    const chartData: Array<DataItem> = useMemo(() => {
        if (!poolStats || !uzdStatData) {
            return [];
        }

        const stratsData = poolStats.pools ? poolStats.pools : poolStats.strategies;

        return poolDataToChartData(
            stratsData,
            stakingMode === 'ZETH' ? uzdStatData.info.zunETH.tvl : uzdStatData.info.zunUSD.tvl
        );
    }, [stakingMode, uzdStatData, poolStats]);

    // APY chart data
    useEffect(() => {
        const url =
            stakingMode === 'ZETH'
                ? getZunEthHistoricalApyUrl(histApyPeriod)
                : getZunUsdHistoricalApyUrl(histApyPeriod);

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

    // Total balance
    const totalBalance = useMemo(() => {
        let val = apsBalance;

        log(`Total balance is: ${val.toString()}`);

        return val;
    }, [apsBalance]);

    const apyPopover = useMemo(() => {
        let apy30 = '0';
        let apy90 = '0';

        if (uzdStatData) {
            apy30 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zunETH.monthlyAvgApy
                    : uzdStatData.info.zunUSD.monthlyAvgApy;

            apy90 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zunETH.threeMonthAvgApy
                    : uzdStatData.info.zunUSD.threeMonthAvgApy;
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

    const apyBarApy = useMemo(() => {
        // incorrect server response handler
        if (!uzdStatLoading && !uzdStatData) {
            return '0%';
        }

        if (stakingMode === 'ZETH') {
            return uzdStatLoading || !uzdStatData
                ? 'n/a'
                : `${uzdStatData.info.zunETH.apy.toFixed(2)}%`;
        } else {
            return uzdStatLoading ? 0 : `${uzdStatData.info.zunUSD.apy.toFixed(2)}%`;
        }
    }, [stakingMode, uzdStatData, uzdStatLoading]);

    const apyBarMonthlyApy = useMemo(() => {
        let result = '0%';

        if (!uzdStatData) {
            return result;
        }

        result =
            stakingMode === 'ZETH'
                ? uzdStatData.info.zunETH.monthlyAvgApy
                : uzdStatData.info.zunUSD.monthlyAvgApy;

        result = `${Number(result).toFixed(2)}%`;

        return result;
    }, [stakingMode, uzdStatData]);

    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <React.Fragment>
                <MobileSidebar />
                <AllServicesPanel />
                <UnsupportedChain
                    text="You're using unsupported chain. Please, switch to Ethereum network."
                    customNetworksList={[networks[0]]}
                />
                <div className="container">
                    <ApyDetailsModal
                        show={showApyDetailsModal}
                        onHide={() => {
                            setShowApyDetailsModal(false);
                        }}
                    />
                    <div className="row main-row h-100">
                        <SideBar isMainPage={true} tvl={tvl}>
                            <SidebarTopButtons />
                            <div className="mobile-menu-title d-block d-lg-none">Menu</div>
                            <div
                                className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                                style={{
                                    fontSize: '13px',
                                    overflowX: 'scroll',
                                }}
                            >
                                {renderMobileMenu()}
                            </div>
                            <div className="Sidebar__Content__Data">
                                <div className="title">Your data</div>
                                <div className="values gap-2">
                                    <div
                                        className="balance col-6"
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
                                        </div>
                                        <div className="value">
                                            {!account && 'n/a'}
                                            {account &&
                                                totalBalance.toNumber() !== -1 &&
                                                `$ ${getBalanceNumber(totalBalance)
                                                    .toNumber()
                                                    .toLocaleString('en')}`}
                                        </div>
                                    </div>
                                    <div className="total-income col-6"></div>
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
                                baseApy={
                                    uzdStatLoading || !uzdStatData
                                        ? 0
                                        : uzdStatData.info.zunUSD.apy.toFixed(2)
                                }
                                deposit={`$${getBalanceNumber(apsBalance)
                                    .toNumber()
                                    .toLocaleString('en')}`}
                                tvl={
                                    uzdStatLoading || !uzdStatData
                                        ? '0'
                                        : `$${Number(
                                              getBalanceNumber(uzdStatData.info.zunUSD.tvlUsd)
                                          ).toLocaleString('en', {
                                              maximumFractionDigits: 0,
                                          })}`
                                }
                                className="mt-3"
                                onSelect={() => {
                                    setStakingMode('UZD');
                                }}
                            />
                            {/* <StakingSummary
                                logo="ZETH"
                                selected={stakingMode === 'ZETH'}
                                baseApy={
                                    uzdStatLoading || !uzdStatData
                                        ? 0
                                        : formatPoolApy(uzdStatData.info.zunETH.apy)
                                }
                                deposit={`${getBalanceNumber(zethBalance)
                                    .toNumber()
                                    .toLocaleString('en')} ZETH`}
                                tvl={
                                    uzdStatLoading || !uzdStatData
                                        ? '0'
                                        : `${getBalanceNumber(uzdStatData.info.zunETH.tvl)
                                              .toNumber()
                                              .toLocaleString('en')} ZETH`
                                }
                                className="mt-3"
                                onSelect={() => {
                                    setStakingMode('ZETH');
                                }}
                                comingSoon={true}
                            /> */}
                        </SideBar>
                        <div className="col content-col dashboard-col">
                            <Header section="dashboard" />
                            <div className="row ms-lg-4">
                                <div className="col-lg-7 col-xs-12">
                                    <div className="fast-deposit-wrapper">
                                        <FastDepositForm
                                            stakingMode={stakingMode}
                                            className="m-lg-3 mt-lg-0"
                                        />
                                    </div>
                                    <div className="ApyBar ms-lg-3 me-lg-3 mt-3 mt-lg-0">
                                        <div className="ApyBar__title">APY Bar</div>
                                        <div className="ApyBar__counters">
                                            <div className="ApyBar__Counter">
                                                <div className="ApyBar__Counter__Title d-flex align-items-start gap-2">
                                                    <span>Base APY</span>
                                                    <div className="hint">
                                                        <svg
                                                            width="13"
                                                            height="13"
                                                            viewBox="0 0 13 13"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            onClick={() =>
                                                                setShowApyDetailsModal(true)
                                                            }
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                clipRule="evenodd"
                                                                d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM6.23296 9.97261H4.98638L5.79002 7.12336H3.02741V5.87679H6.14162L6.94529 3.02741H8.19186L7.38819 5.87679L9.97261 5.87679V7.12336H7.03659L6.23296 9.97261Z"
                                                                fill="black"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="ApyBar__Counter__Value ApyBar__Counter__Value--primary vela-sans">
                                                    <div>{apyBarApy}</div>
                                                </div>
                                            </div>
                                            <MicroCard
                                                title="Projected APY"
                                                hint="This is a yield indicator based
                                                                    on accumulated rewards that have
                                                                    not been harvested and
                                                                    auto-compounded yet. Current
                                                                    accumulated rewards:"
                                                value="0%"
                                                className="align-items-start stablecoin ApyBar__Counter"
                                            />
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
                                                    {apyBarMonthlyApy}
                                                </div>
                                            </div>
                                        </div>
                                        <ApyChart
                                            data={histApyData}
                                            onRangeChange={(range: string) => {
                                                setHistApyPeriod(range);
                                            }}
                                        />
                                        {uzdStatLoading && (
                                            <Preloader onlyIcon={true} className="blocker round" />
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-5 col-xs-12 d-flex flex-column">
                                    <DashboardCarousel
                                        className={`features-slider mb-3 mt-3 mt-lg-0 order-2 order-lg-0`}
                                        style={{
                                            height: '222px',
                                        }}
                                    />
                                    <Chart
                                        items={chartData}
                                        className="p-4 flex-grow-1 mt-3 mt-lg-0"
                                        title={
                                            stakingMode === 'ZETH'
                                                ? 'APS diversification strategies'
                                                : 'APS diversification strategies'
                                        }
                                    />
                                </div>
                            </div>
                            <SupportersBar section="dashboard" className="mt-2" />
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
