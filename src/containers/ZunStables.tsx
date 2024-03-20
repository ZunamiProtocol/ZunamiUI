import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ZunStables.scss';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SideBar } from '../components/SideBar/SideBar';
import { Header } from '../components/Header/Header';
import { SidebarTopButtons } from '../components/SidebarTopButtons/SidebarTopButtons';
import { Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { MicroCard } from '../components/MicroCard/MicroCard';
import { AddressButtons } from '../components/AddressButtons/AddressButtons';
import { BIG_ZERO, getFullDisplayBalance } from '../utils/formatbalance';
import { StrategyListItem } from '../components/StrategyListItem/StrategyListItem';
import { DataItem } from '../components/Chart/Chart';
import { PieChart2 } from '../components/PieChart/PieChart';
import { renderMobileMenu } from '../components/Header/NavMenu/NavMenu';
import { ZunPoolSummary } from '../components/ZunPoolSummary/ZunPoolSummary';
import { getZunEthAddress, getZunUsdAddress } from '../utils/zunami';
import { useNetwork } from 'wagmi';
import {
    getZunEthHistoricalApyUrl,
    getZunEthStratsUrl,
    getZunUsdHistoricalApyUrl,
    getZunUsdStratsUrl,
    uzdStakingInfoUrl,
} from '../api/api';
import useTotalSupply from '../hooks/useTotalSupply';
import { ZunAggInfo, fallbackData } from './Main';
import useFetch from 'react-fetch-hook';
import { poolDataToChartData } from '../functions/pools';
import useBalanceOf from '../hooks/useBalanceOf';

interface CurvePool {
    address: string;
    coins: Array<any>;
}

interface CurveFactoryDataResponse {
    data: {
        poolData: Array<CurvePool>;
    };
}

interface CurveLink {
    url: string;
    title: string;
}

function getSelectedCoinAddress(chainId: number, stakingMode: string) {
    if (stakingMode === 'ZETH') {
        return getZunEthAddress(chainId);
    }

    return getZunUsdAddress(chainId);
}

function getCurveLink(stakingMode: string = 'zunUSD'): CurveLink {
    if (stakingMode === 'ZETH') {
        return {
            url: 'https://curve.fi/#/ethereum/pools/factory-stable-ng-121/deposit',
            title: 'zunETH / frxETH',
        };
    }

    return {
        url: 'https://curve.fi/#/ethereum/pools/factory-stable-ng-104/deposit',
        title: 'zunUSD / crvUSD',
    };
}

export const ZunStables = (): JSX.Element => {
    const { chain } = useNetwork();
    const chainId: number = chain ? chain.id : 1;
    const [tvl, setTvl] = useState('0');
    const [histApyPeriod, setHistApyPeriod] = useState('week');
    const [histApyData, setHistApyData] = useState([]);
    const [stakingMode, setStakingMode] = useState('zunUSD');
    const totalSupply = useTotalSupply(
        stakingMode === 'zunUSD' ? getZunUsdAddress(chainId) : getZunEthAddress(chainId)
    );

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
                setHistApyData(items.data);
            })
            .catch((error) => {
                setHistApyData([]);
            });
    }, [histApyPeriod, stakingMode]);

    const [uzdStatLoading, setUzdStatLoading] = useState(true);
    const [uzdStatData, setUzdStatData] = useState<ZunAggInfo>(fallbackData);

    // Load aggregated info
    useEffect(() => {
        fetch(uzdStakingInfoUrl)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setUzdStatLoading(false);

                // if some item is NULL, then use fallback data
                Object.keys(data.info).forEach((index) => {
                    if (!data.info[index]) {
                        data.info[index] = {
                            monthlyAvgApr: 0,
                            threeMonthAvgApr: 0,
                            apr: 0,
                            apy: 0,
                            tvl: BIG_ZERO,
                            tvlUsd: 0,
                        };
                    }
                });

                setUzdStatData(data);
            })
            .catch((error) => {
                setUzdStatData(fallbackData);
                setUzdStatLoading(false);
            });
    }, []);

    // TVL
    useEffect(() => {
        if (!uzdStatData) {
            return;
        }

        setTvl(uzdStatData.totalTvlUsd.toString());
    }, [uzdStatData]);

    // APY 30,90 days popover
    const apyPopover = useMemo(() => {
        let apy30 = 0;
        let apy90 = 0;

        if (uzdStatData) {
            apy30 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zunETH.monthlyAvgApr
                    : uzdStatData.info.zunUSD.monthlyAvgApr;

            apy90 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zunETH.threeMonthAvgApr
                    : uzdStatData.info.zunUSD.threeMonthAvgApr;
        }

        return (
            <Popover>
                <Popover.Body>
                    <div className="">
                        <span>Average APR in 30 days: </span>
                        <span className="text-primary">{apy30.toFixed(2)}%</span>
                    </div>
                    <div className="">
                        <span>Average APR in 90 days: </span>
                        <span className="text-primary">{apy90.toFixed(2)}%</span>
                    </div>
                </Popover.Body>
            </Popover>
        );
    }, [stakingMode, uzdStatData]);

    // Pool strategies
    const { data: rawPoolList } = useFetch(
        stakingMode === 'ZETH' ? getZunEthStratsUrl() : getZunUsdStratsUrl()
    );

    const poolList = useMemo(() => {
        // @ts-ignore
        if (rawPoolList && rawPoolList.strategies.length) {
            return poolDataToChartData(
                // @ts-ignore
                rawPoolList.strategies,
                stakingMode === 'ZETH' ? uzdStatData.info.zunETH.tvl : uzdStatData.info.zunUSD.tvl
            );
        } else {
            return [];
        }
    }, [rawPoolList, stakingMode, uzdStatData]);

    const zunUsdBalance = useBalanceOf(getZunUsdAddress(chainId));

    // zunUSD price
    const { data: curveData, isLoading: curveDataLoading } = useFetch<CurveFactoryDataResponse>(
        'https://api.curve.fi/api/getPools/ethereum/factory-stable-ng'
    );

    const zunCoinPool = useMemo(() => {
        let result = 0;

        if (curveDataLoading) {
            return null;
        }

        try {
            result =
                stakingMode === 'zunUSD'
                    ? // @ts-ignore
                      curveData.data.poolData.filter(
                          (pool: any) =>
                              pool.address === '0x8C24b3213FD851db80245FCCc42c40B94Ac9a745'
                      )[0].coins[1].usdPrice
                    : // @ts-ignore
                      curveData.data.poolData.filter(
                          (pool: any) =>
                              pool.address === '0x3a65cbaebbfecbea5d0cb523ab56fdbda7ff9aaa'
                      )[0].coins[0].usdPrice;
        } catch (e) {}

        return result;
    }, [curveDataLoading, curveData?.data?.poolData, stakingMode]);

    return (
        <React.Fragment>
            <MobileSidebar />
            <AllServicesPanel />
            <div className="container">
                <div className="row main-row h-100 ZunStablesContainer">
                    <SideBar isMainPage={false} tvl={tvl}>
                        <SidebarTopButtons />
                        <div className="mobile-menu-title d-block d-xxl-none">Menu</div>
                        <div
                            className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                            style={{
                                fontSize: '13px',
                                overflowX: 'scroll',
                            }}
                        >
                            {renderMobileMenu()}
                        </div>
                        <div className="card mt-3 zun-token-card">
                            <div className="card-body p-3">
                                <div className="ms-2 mt-2">
                                    <span>Your data</span>
                                </div>
                                <div className="balance">
                                    <div className="d-flex flex-row small-block align-items-center stablecoin mb-3 ps-3 me-3 me-lg-2 mt-3 justify-content-between">
                                        <div>
                                            <div>
                                                <span className="name">Balance</span>
                                            </div>
                                            <div className="vela-sans value mt-1 d-flex align-items-center">
                                                <span>${getFullDisplayBalance(zunUsdBalance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ZunPoolSummary
                            logo="USD"
                            selected={stakingMode === 'zunUSD'}
                            baseApy={uzdStatData.info.zunUSD.apr.toFixed(2)}
                            tvl={`$${Math.round(
                                Number(getFullDisplayBalance(uzdStatData.info.zunUSD.tvl))
                            ).toLocaleString('en', {
                                maximumFractionDigits: 0,
                            })}`}
                            className="mt-3"
                            onSelect={() => {
                                setStakingMode('zunUSD');
                            }}
                        />
                        <ZunPoolSummary
                            logo="ETH"
                            selected={stakingMode === 'ZETH'}
                            baseApy={uzdStatData.info.zunETH.apr.toFixed(2)}
                            tvl={Math.round(
                                Number(getFullDisplayBalance(uzdStatData.info.zunETH.tvl))
                            ).toLocaleString('en', {
                                maximumFractionDigits: 0,
                            })}
                            className="mt-3"
                            onSelect={() => {
                                setStakingMode('ZETH');
                            }}
                        />
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header section="uzd" />
                        {/* First row */}
                        <div className="row ms-md-4">
                            {/* Infobar col */}
                            <div className="col-xxl-7 col-xs-12">
                                <div className="card m-xxl-3 mt-xxl-0 h-100">
                                    <div className="card-body p-3">
                                        <div className="title">Info bar</div>
                                        <div className="row mt-3">
                                            <div className="col-6 col-md-6 col-xxl-4">
                                                <MicroCard
                                                    title="Total circulating"
                                                    hint="The amount of coins that have already been created and circulating in the market."
                                                    value={Math.round(
                                                        Number(getFullDisplayBalance(totalSupply))
                                                    ).toLocaleString('en', {
                                                        maximumFractionDigits: 0,
                                                    })}
                                                    className="align-items-start stablecoin mb-3 ps-3 me-3 me-lg-2"
                                                />
                                            </div>
                                            <div className="col-6 col-md-6 col-xxl-4">
                                                <MicroCard
                                                    title="Collateral"
                                                    hint="Value of the Omnipool reserves."
                                                    value={
                                                        uzdStatLoading
                                                            ? 'loading'
                                                            : Number(
                                                                  Math.round(
                                                                      stakingMode === 'zunUSD'
                                                                          ? uzdStatData.info.zunUSD
                                                                                .tvlUsd
                                                                          : uzdStatData.info.zunETH
                                                                                .tvlUsd
                                                                  )
                                                              ).toLocaleString('en', {
                                                                  maximumFractionDigits: 0,
                                                              })
                                                    }
                                                    className="align-items-start stablecoin mb-3 ps-3 me-0 me-lg-2"
                                                />
                                            </div>
                                            <div className="col-6 col-md-6 col-xxl-4">
                                                <MicroCard
                                                    title="Contract address"
                                                    className="align-items-start stablecoin mb-3 ps-3 me-3 me-lg-2"
                                                >
                                                    <AddressButtons
                                                        address={getSelectedCoinAddress(
                                                            chainId,
                                                            stakingMode
                                                        )}
                                                        link={true}
                                                    />
                                                </MicroCard>
                                            </div>
                                            <div className="col-6 col-md-6 col-xxl-4">
                                                <MicroCard
                                                    title={`zun${
                                                        stakingMode === 'zunUSD' ? 'USD' : 'ETH'
                                                    } price`}
                                                    hint="Current market price on Curve Finance."
                                                    value={
                                                        !curveDataLoading
                                                            ? `$${String(zunCoinPool).substring(
                                                                  0,
                                                                  String(zunCoinPool).indexOf('.') +
                                                                      6
                                                              )}`
                                                            : 0
                                                    }
                                                    className="align-items-start stablecoin mb-3 ps-3 me-0 me-lg-2"
                                                />
                                            </div>
                                            <div className="col-12 col-md-12 col-xxl-8">
                                                <div
                                                    id="stake-and-boost"
                                                    className="gray-block small-block align-items-start stablecoin ps-3 me-0 me-lg-2"
                                                >
                                                    <svg
                                                        width="69"
                                                        height="66"
                                                        viewBox="0 0 69 66"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="bg"
                                                    >
                                                        <path
                                                            d="M28.5498 42.9343C23.9987 41.3666 19.8065 39.9224 15.6142 38.4784C12.0415 37.2478 8.46894 36.0167 4.89657 34.7851C2.30199 33.8859 1.75666 31.3292 3.77037 29.4594C23.3708 11.2599 42.9733 -6.93727 62.5782 -25.132C62.9632 -25.4893 63.3312 -25.867 63.7348 -26.2018C64.946 -27.2066 66.4524 -27.1963 67.7088 -26.1953C68.2735 -25.7565 68.6604 -25.1277 68.7977 -24.4254C68.935 -23.7231 68.8135 -22.9951 68.4555 -22.3762C66.8052 -19.3814 65.1112 -16.4107 63.4321 -13.4319C57.1514 -2.28968 50.8687 8.85143 44.5842 19.9914C44.3969 20.2795 44.1947 20.5576 43.9784 20.8244C44.4916 21.0188 44.8106 21.1494 45.1359 21.2614C51.9706 23.615 58.8064 25.9652 65.6434 28.3119C66.6901 28.67 67.5467 29.1941 67.9235 30.2998C68.3679 31.6039 67.9787 32.6704 67.0416 33.616C64.13 36.5539 61.2254 39.4988 58.3278 42.4507C40.7844 60.2369 23.2403 78.0224 5.69535 95.8071C5.42642 96.0944 5.13691 96.3617 4.8291 96.6068C4.32822 96.987 3.71748 97.1941 3.08868 97.1968C2.45988 97.1995 1.847 96.9977 1.34212 96.6218C0.281335 95.8331 -0.151054 94.5281 0.292686 93.2901C0.488085 92.802 0.723109 92.3308 0.99541 91.8813C9.90682 75.9186 18.8224 59.9583 27.7421 44.0003C27.9319 43.6607 28.214 43.3728 28.5498 42.9343Z"
                                                            fill="url(#paint0_linear_968_4725)"
                                                            fillOpacity="0.47"
                                                        />
                                                        <defs>
                                                            <linearGradient
                                                                id="paint0_linear_968_4725"
                                                                x1="5.56752"
                                                                y1="93.586"
                                                                x2="78.117"
                                                                y2="-56.9332"
                                                                gradientUnits="userSpaceOnUse"
                                                            >
                                                                <stop
                                                                    stopColor="white"
                                                                    stopOpacity="0"
                                                                />
                                                                <stop
                                                                    offset="1"
                                                                    stopColor="white"
                                                                    stopOpacity="0.63"
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>

                                                    <div className="text-white d-flex align-items-center">
                                                        <div className="col-6">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="name2">
                                                                    Stake and boost up to{' '}
                                                                    {Math.trunc(
                                                                        stakingMode === 'zunUSD'
                                                                            ? uzdStatData.info
                                                                                  .zunUSDAps.apy
                                                                            : uzdStatData.info
                                                                                  .zunETHAps.apy
                                                                    )}
                                                                    % in APS!
                                                                </span>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Buy zunUSD on */}
                            <div className="col-xxl-5 col-xs-12 d-flex flex-column mt-3 mt-xxl-0">
                                <div className="card buy-uzd h-100">
                                    <div className="card-body p-3">
                                        <svg
                                            width="108"
                                            height="128"
                                            viewBox="0 0 108 128"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="bg"
                                        >
                                            <path
                                                d="M107.127 74.1049C105.27 70.6399 101.055 69.3925 97.7135 71.3165L70.5168 86.977L57.5111 61.215L77.6703 11.1787C78.8 8.37629 78.1042 5.13999 75.9333 3.09884C73.7624 1.05895 70.5884 0.655049 68.0057 2.09164L36.5134 19.6214L28.5523 3.85185C26.7797 0.341618 22.594 -1.02043 19.2086 0.820695C15.8207 2.65799 14.5116 6.99387 16.2842 10.5054L24.3144 26.4118L3.64849 37.9151C0.280295 39.7906 -0.9834 44.1411 0.824865 47.6323C2.63435 51.1227 6.82862 52.4326 10.2005 50.5596L30.7345 39.1293L42.2301 61.9002L19.6044 118.059C18.4686 120.879 19.1803 124.136 21.3783 126.173C22.6776 127.378 24.3285 128 25.9942 128C27.1448 128 28.3027 127.703 29.355 127.097L64.8311 106.669L69.9148 116.739C71.1514 119.189 73.5608 120.59 76.055 120.59C77.1355 120.59 78.2345 120.327 79.2585 119.77C82.6463 117.933 83.9555 113.597 82.1829 110.086L76.9385 99.6975L104.438 83.8628C107.78 81.9376 108.985 77.5693 107.127 74.1049ZM42.9335 32.3388L57.3799 24.2972L49.1659 44.6846L42.9335 32.3388ZM40.0681 104.51L50.5753 78.4307L58.4094 93.9488L40.0681 104.51Z"
                                                fill="url(#paint0_linear_968_98018)"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_968_98018"
                                                    x1="24.3529"
                                                    y1="10.9402"
                                                    x2="80.1484"
                                                    y2="110.745"
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
                                            <span>Buy zunUSD on</span>
                                        </div>
                                        <div className="d-flex flex-column mt-3 gap-3 me-3">
                                            <a
                                                className="gray-block small-block align-items-start stablecoin mb-2 mb-md-0 col-6 bg-white"
                                                href={getCurveLink(stakingMode).url}
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
                                                    {getCurveLink(stakingMode).title}
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Second row */}
                        <div className="row ms-md-4 mt-3 h-100 mb-3">
                            <div className="col">
                                <div className="card ms-xxl-3 mt-xxl-0 h-100">
                                    <div className="card-body p-4">
                                        <div className="title">Collateral Analytics</div>
                                        <div id="collateral-block" className="row mt-3">
                                            <div className="col-xs-12 col-md-4">
                                                <MicroCard
                                                    title="Collateral APR now"
                                                    value={
                                                        uzdStatLoading
                                                            ? 'loading'
                                                            : `${Number(
                                                                  stakingMode === 'zunUSD'
                                                                      ? uzdStatData.info.zunUSD.apr
                                                                      : uzdStatData.info.zunETH.apr
                                                              ).toLocaleString('en', {
                                                                  maximumFractionDigits: 0,
                                                              })}%`
                                                    }
                                                    className="align-items-start stablecoin mb-3 ps-3 me-0 me-lg-2"
                                                />
                                                <MicroCard
                                                    title="Average APR"
                                                    popover={apyPopover}
                                                    value="in 30, 90 days"
                                                    className="align-items-start stablecoin mb-3 ps-3 me-0 me-lg-2"
                                                />
                                            </div>
                                            <div className="col-xs-12 col-md-8">
                                                <ApyChart
                                                    data={histApyData}
                                                    onRangeChange={(range: string) => {
                                                        setHistApyPeriod(range);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col col-xs-12 col-lg-5">
                                                <PieChart2 data={poolList} hideList hideSummary />
                                            </div>
                                            <div className="col col-xs-12 col-lg-7">
                                                <div className="row">
                                                    {poolList.map((pool: any) => (
                                                        <div
                                                            key={pool.address}
                                                            className="col-xs-12 col-sm-12 col-lg-6"
                                                        >
                                                            <StrategyListItem
                                                                title={pool.title}
                                                                description={pool.description}
                                                                percent={pool.value}
                                                                color={pool.color}
                                                                amount={Math.trunc(pool.tvlUsd)}
                                                                apr={pool.apr.toFixed(2)}
                                                                icon={pool.icon}
                                                                primaryIcon={pool.primaryIcon}
                                                                secondaryIcon={pool.secondaryIcon}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
