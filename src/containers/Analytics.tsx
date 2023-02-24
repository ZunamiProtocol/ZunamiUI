import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header/Header';
import { SideBar, ZunamiInfo, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import './Analytics.scss';
import { useWallet } from 'use-wallet';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import useEagerConnect from '../hooks/useEagerConnect';
import useFetch from 'react-fetch-hook';
import { getActiveStratsUrl, zunamiInfoUrl } from '../api/api';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { PieChart2 } from '../components/PieChart/PieChart';
import BigNumber from 'bignumber.js';
import { getBalanceNumber } from '../utils/formatbalance';

interface PoolsStats {
    pools: Array<PoolInfo>;
}

export const Analytics = (): JSX.Element => {
    const { account, connect, ethereum, chainId } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);
    const [selectedStrat, setSelectedStrat] = useState(null);

    const {
        isLoading: isZunLoading,
        data: zunData,
        error: zunError,
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const { data: activeStratsStat } = useFetch(getActiveStratsUrl());
    const poolStats = activeStratsStat as PoolsStats;
    const chartData =
        poolStats && poolStats.pools && zunamiInfo
            ? poolDataToChartData(poolStats.pools, zunamiInfo.tvl)
            : [];
    const collateralData = [
        {
            address: '0x9848EDb097Bee96459dFf7609fb582b80A8F8EfD',
            color: '#FA6005',
            link: 'https://etherscan.io/address/0x9848EDb097Bee96459dFf7609fb582b80A8F8EfD',
            title: 'BTC',
            tvlInUsd: '836755',
            tvlInZunami: 8.367551075392854e23,
            type: 'STAKE_DAO_MIM',
            value: 92.09894980200251,
        },
        {
            address: '0x9848EDb097Bee96459dFf7609fb582b80A8F8EfD',
            color: '#159FFD',
            link: 'https://etherscan.io/address/0x9848EDb097Bee96459dFf7609fb582b80A8F8EfD',
            title: 'USDT',
            tvlInUsd: '836755',
            tvlInZunami: 8.367551075392854e23,
            type: 'STAKE_DAO_MIM',
            value: 92.09894980200251,
        },
    ];

    useEffect(() => {
        if (chartData.length && !selectedStrat) {
            setSelectedStrat(chartData[0]);
        }
    }, [chartData, selectedStrat]);

    return (
        <React.Fragment>
            <MobileSidebar />
            <div className="container">
                <div className="row main-row h-100 AnalyticsContainer">
                    <SideBar isMainPage={false}>
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
                                <span className="text-muted mt-2">Deposit&Withdraw</span>
                            </a>
                            <a
                                href="/uzd"
                                className="text-center d-flex flex-column text-decoration-none selected"
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
                        <div className="card InfoBar mt-3 dao-strats">
                            <div className="card-body">
                                <div className="title">
                                    DAO Stablecoin diversification strategies
                                </div>
                                <div className="mt-4">
                                    <PieChart2 data={chartData} />
                                </div>
                            </div>
                        </div>
                        <div className="card InfoBar mt-3 strats-strats">
                            <div className="card-body">
                                <div className="title">Strategies</div>
                                <div className="mt-4">QWE</div>
                            </div>
                        </div>
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header />
                        <div className="">
                            <div className="ps-4">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="title">
                                                Choose the pool to get more info
                                            </div>
                                            <div className="pools mt-3 gap-3">
                                                {chartData.map((pool) => (
                                                    <div
                                                        className={`pool-item d-flex ${
                                                            pool.type === selectedStrat?.type
                                                                ? 'selected'
                                                                : ''
                                                        }`}
                                                        key={pool.title}
                                                        onClick={() => {
                                                            setSelectedStrat(pool);
                                                        }}
                                                    >
                                                        <img src={pool.icon} alt={pool.title} />
                                                        <div>
                                                            <div className="subtitle">
                                                                {pool.title.split(' - ')[1]}
                                                            </div>
                                                            <div className="name">
                                                                {pool.title.split(' - ')[0]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="title">Other sources</div>
                                            <div className="d-flex flex-wrap gap-3 mt-3">
                                                <a href="#dune" className="gray-block">
                                                    <img src="/dune.svg" alt="Dune Analytics" />
                                                    <div>
                                                        <div className="name">Dune Analytics</div>
                                                    </div>
                                                </a>
                                                <a href="#treasure" className="gray-block">
                                                    <img
                                                        src="/treasure.svg"
                                                        alt="Treasure Analytics"
                                                    />
                                                    <div>
                                                        <div className="name">
                                                            Treasure Analytics
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <h2 className="mt-5">Pool Info</h2>
                                        </div>
                                    </div>
                                    {selectedStrat && (
                                        <div className="row selected-strat">
                                            <div className="col">
                                                <div className="tbl align-items-center">
                                                    <div className="d-flex flex-wrap w-100">
                                                        <div className="logos d-flex gap-2 w-100 mt-0">
                                                            <img
                                                                src={selectedStrat.icon}
                                                                alt={selectedStrat.title}
                                                            />
                                                            <div className="meta">
                                                                <div className="subtitle">
                                                                    {
                                                                        selectedStrat.title.split(
                                                                            ' - '
                                                                        )[1]
                                                                    }
                                                                </div>
                                                                <div className="name">
                                                                    {
                                                                        selectedStrat.title.split(
                                                                            ' - '
                                                                        )[0]
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="subtitle">Volume</div>
                                                        <div>00000000</div>
                                                    </div>
                                                    <div>
                                                        <div className="subtitle">TVL, $</div>
                                                        <div>
                                                            {Number(
                                                                selectedStrat.tvlInUsd
                                                            ).toLocaleString('en', {
                                                                maximumFractionDigits: 0,
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="subtitle">Pool balance</div>
                                                        <div>00000000</div>
                                                    </div>
                                                    <div>
                                                        <div className="subtitle">
                                                            Contract address
                                                        </div>
                                                        <div>
                                                            <a
                                                                href={`https://etherscan.io/address/${selectedStrat.address}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="ext-link"
                                                            >
                                                                <svg
                                                                    width="15"
                                                                    height="14"
                                                                    viewBox="0 0 10 12"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M5.86724 1L3.63471 1C1.80809 1 1.19922 2.21775 1.19922 3.43549C1.19922 4.40969 1.19922 5.46507 1.19922 7.08873C1.19922 8.30647 1.80809 9.52422 3.63471 9.52422C4.12181 9.52422 5.05541 9.52422 7.28795 9.52422C9.11456 9.52422 9.72344 8.30647 9.72344 7.08873V5.26211"
                                                                        stroke="black"
                                                                        strokeLinecap="round"
                                                                    />
                                                                    <g filter="url(#filter0_d_572_205)">
                                                                        <path
                                                                            d="M5.46094 5.26211L9.72305 1M9.72305 1H7.82878M9.72305 1V2.89427"
                                                                            stroke="black"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </g>
                                                                    <defs>
                                                                        <filter
                                                                            id="filter0_d_572_205"
                                                                            x="0.960938"
                                                                            y="0.5"
                                                                            width="13.2622"
                                                                            height="13.2622"
                                                                            filterUnits="userSpaceOnUse"
                                                                            colorInterpolationFilters="sRGB"
                                                                        >
                                                                            <feFlood
                                                                                floodOpacity="0"
                                                                                result="BackgroundImageFix"
                                                                            />
                                                                            <feColorMatrix
                                                                                in="SourceAlpha"
                                                                                type="matrix"
                                                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                                                result="hardAlpha"
                                                                            />
                                                                            <feOffset dy="4" />
                                                                            <feGaussianBlur stdDeviation="2" />
                                                                            <feComposite
                                                                                in2="hardAlpha"
                                                                                operator="out"
                                                                            />
                                                                            <feColorMatrix
                                                                                type="matrix"
                                                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                                                                            />
                                                                            <feBlend
                                                                                mode="normal"
                                                                                in2="BackgroundImageFix"
                                                                                result="effect1_dropShadow_572_205"
                                                                            />
                                                                            <feBlend
                                                                                mode="normal"
                                                                                in="SourceGraphic"
                                                                                in2="effect1_dropShadow_572_205"
                                                                                result="shape"
                                                                            />
                                                                        </filter>
                                                                    </defs>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStrat && (
                                        <div className="panel mt-4">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="d-flex gap-3">
                                                        <div className="gray-block small-block">
                                                            {
                                                                selectedStrat.title
                                                                    .split(' - ')[1]
                                                                    .split(' pool')[0]
                                                            }
                                                        </div>
                                                        <div className="gray-block small-block align-items-start">
                                                            <div>$350 493</div>
                                                            <div>(50%)</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="gray-block small-block align-items-start stablecoin mb-2">
                                                        <div>
                                                            <img src="/usdt.svg" alt="" />
                                                            <span className="name">USDT</span>
                                                        </div>
                                                        <div className="vela-sans value">
                                                            $100 000 (15%)
                                                        </div>
                                                    </div>
                                                    <div className="gray-block small-block align-items-start stablecoin mb-2">
                                                        <div>
                                                            <img src="/dai.svg" alt="" />
                                                            <span className="name">DAI</span>
                                                        </div>
                                                        <div className="vela-sans value">
                                                            $100 000 (15%)
                                                        </div>
                                                    </div>
                                                    <div className="gray-block small-block align-items-start stablecoin">
                                                        <div>
                                                            <img src="/usdc.svg" alt="" />
                                                            <span className="name">USDC</span>
                                                        </div>
                                                        <div className="vela-sans value">
                                                            $100 000 (15%)
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="gray-block small-block align-items-start">
                                                        <div className="mt-1">Pool Parameters</div>
                                                        <div className="mt-3">
                                                            Pool Parameters A Amplification
                                                            coefficient chosen from fluctuation of
                                                            prices around 1
                                                        </div>
                                                        <div className="mt-3">
                                                            <button className="btn btn-secondary btn-sm">
                                                                200
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStrat && (
                                        <div className="panel mt-4">
                                            <div className="d-flex gap-3">
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Current APR, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Base</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CRV, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CRV, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Incentives, $, MIM</div>
                                                    <div>000</div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-3 mt-3">
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Current APR, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Base</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CRV, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CRV, %</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Incentives, $, MIM</div>
                                                    <div>000</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStrat && (
                                        <div className="panel mt-4">
                                            <div className="d-flex gap-3">
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Last bribes amount</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Amount, $</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Token</div>
                                                    <div>FXS</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Token</div>
                                                    <div>APEFI</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Current weight, %</div>
                                                    <div>34</div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-3 mt-3">
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Last bribes amount</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Amount, $</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Token</div>
                                                    <div>FXS</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Token</div>
                                                    <div>APEFI</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Current weight, %</div>
                                                    <div>34</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="row">
                                        <div className="col">
                                            <h2 className="mt-5">Stablecoin</h2>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="tbl">
                                                <div className="d-flex flex-wrap">
                                                    <div className="logos">
                                                        <svg
                                                            width="22"
                                                            height="22"
                                                            viewBox="0 0 22 22"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M7.17902 0.869951C5.9007 1.42234 4.7437 2.22111 3.77409 3.22063C2.80448 4.22016 2.04123 5.40089 1.52792 6.69539C1.01462 7.98986 0.761322 9.37282 0.782473 10.7652C0.803625 12.1576 1.0988 13.5322 1.65119 14.8105C2.20358 16.0888 3.00234 17.2458 4.00187 18.2154C5.0014 19.1851 6.1821 19.9483 7.47658 20.4616C8.77111 20.9749 10.1541 21.2282 11.5464 21.207C12.9388 21.1859 14.3134 20.8907 15.5917 20.3383C16.87 19.7859 18.027 18.9872 18.9966 17.9876C19.9663 16.9881 20.7295 15.8074 21.2428 14.5129C21.7561 13.2184 22.0094 11.8355 21.9883 10.4431C21.9671 9.05069 21.6719 7.6761 21.1195 6.39777C20.5672 5.11946 19.7684 3.96245 18.7689 2.99284C17.7693 2.02323 16.5886 1.25998 15.2941 0.746672C13.9996 0.23337 12.6167 -0.0199283 11.2243 0.00122345C9.83194 0.0223752 8.45729 0.317565 7.17902 0.869951Z"
                                                                fill="url(#paint0_linear_572_483)"
                                                            />
                                                            <path
                                                                d="M19.0788 12.4061L18.6932 11.675C18.6532 11.5991 18.5985 11.5319 18.5325 11.4772C18.4664 11.4225 18.3901 11.3815 18.3081 11.3562C18.2262 11.3307 18.14 11.3216 18.0546 11.3294C17.9691 11.3373 17.8861 11.3619 17.8101 11.4019L14.2168 13.2969L12.5019 10.0449L15.1869 3.56874C15.2297 3.46648 15.245 3.35483 15.2314 3.24483C15.2271 3.14944 15.2019 3.05615 15.1576 2.97159L14.7721 2.24072C14.7321 2.16486 14.6775 2.09766 14.6115 2.04298C14.5454 1.9883 14.4691 1.94723 14.3871 1.92212C14.3052 1.89659 14.219 1.88747 14.1336 1.89529C14.0481 1.90311 13.9651 1.9277 13.8891 1.96768L9.47116 4.29764L8.57947 2.60675C8.53941 2.5309 8.4848 2.4637 8.4187 2.40901C8.35266 2.35432 8.27649 2.31321 8.19448 2.28804C8.1126 2.26239 8.02641 2.25323 7.94093 2.26107C7.85545 2.2689 7.77238 2.29358 7.6965 2.3337L6.96564 2.71907C6.88976 2.75912 6.8226 2.81374 6.76787 2.87982C6.7132 2.94591 6.67208 3.02213 6.64693 3.10414C6.62137 3.18605 6.6122 3.27221 6.62002 3.35766C6.62784 3.44312 6.65248 3.52619 6.69246 3.60211L7.58415 5.29272L5.05529 6.62632C4.97944 6.66632 4.91222 6.72094 4.85755 6.78697C4.80287 6.85302 4.76181 6.92925 4.73668 7.01119C4.71108 7.09314 4.70192 7.17933 4.70974 7.26481C4.71756 7.35029 4.7422 7.43336 4.78224 7.50929L5.16771 8.24015C5.20771 8.31603 5.26231 8.38319 5.32838 8.43786C5.39445 8.49259 5.47068 8.53365 5.55268 8.55875C5.6346 8.58432 5.72073 8.59345 5.80619 8.58561C5.89165 8.57784 5.97474 8.55321 6.05066 8.51321L8.57923 7.17968L10.1475 10.1536L7.32105 16.971C7.284 17.0647 7.26774 17.1654 7.27345 17.266C7.2794 17.3667 7.30727 17.4649 7.35499 17.5538C7.36435 17.571 7.37148 17.585 7.37884 17.5994L7.78162 18.3636C7.82163 18.4395 7.87618 18.5067 7.94222 18.5613C8.00832 18.6161 8.08449 18.6571 8.1665 18.6822C8.22941 18.7018 8.29498 18.7118 8.36091 18.7118C8.46671 18.7117 8.57093 18.6859 8.66459 18.6367L13.325 16.1789L13.8651 17.2031C13.9051 17.279 13.9597 17.3462 14.0258 17.4009C14.0919 17.4556 14.1681 17.4966 14.2501 17.5217C14.332 17.5473 14.4181 17.5564 14.5036 17.5486C14.589 17.5408 14.6721 17.5162 14.7481 17.4762L15.479 17.0907C15.5548 17.0507 15.622 16.996 15.6766 16.9299C15.7313 16.8639 15.7724 16.7877 15.7975 16.7057C15.8231 16.6238 15.8322 16.5377 15.8244 16.4522C15.8166 16.3667 15.792 16.2837 15.752 16.2077L15.2119 15.1838L18.8055 13.2888C18.8814 13.2488 18.9486 13.1942 19.0033 13.1281C19.0579 13.062 19.0991 12.9858 19.1242 12.9038C19.1498 12.8219 19.1589 12.7358 19.1511 12.6504C19.1433 12.565 19.1187 12.4819 19.0788 12.4061ZM10.4662 6.18461L12.1643 5.28919L11.2091 7.59313L10.4662 6.18461ZM12.3299 14.292L10.2966 15.3642L11.4404 12.6054L12.3299 14.292Z"
                                                                fill="white"
                                                            />
                                                            <defs>
                                                                <linearGradient
                                                                    id="paint0_linear_572_483"
                                                                    x1="7.5"
                                                                    y1="3.13988e-08"
                                                                    x2="16.5"
                                                                    y2="21"
                                                                    gradientUnits="userSpaceOnUse"
                                                                >
                                                                    <stop stopColor="#FF9D04" />
                                                                    <stop
                                                                        offset="0.99932"
                                                                        stopColor="#FB7004"
                                                                    />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                        <svg
                                                            width="40"
                                                            height="18"
                                                            viewBox="0 0 40 18"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="ms-2"
                                                        >
                                                            <path
                                                                d="M10.3278 4.66016V10.672C10.3278 12.8851 8.29136 14.6797 5.78106 14.6797C4.10653 14.6797 2.74942 13.1842 2.74942 11.3396V4.66016H0.0546946V11.3226C0.0523062 12.8258 0.650383 14.2689 1.71814 15.3361C2.78589 16.4033 4.23644 17.0079 5.75255 17.0176C6.87206 17.0249 7.98061 16.7984 9.00603 16.3529C9.58129 16.0982 10.0471 15.6498 10.321 15.0872V16.6786H10.3278V16.6838H13.0225V4.66016H10.3278Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M37.1233 0.654297V0.654767H37.1196V6.26415C36.7957 5.70795 36.2992 5.27033 35.7042 5.01644C34.7218 4.57233 33.6563 4.33766 32.5766 4.32762C28.578 4.32762 25.3359 7.16797 25.3359 10.6723C25.3359 14.1761 27.899 17.017 31.0614 17.017C31.8134 17.0171 32.5579 16.8702 33.2526 16.5849C33.9473 16.2996 34.5785 15.8814 35.1101 15.3543C35.6418 14.8271 36.0636 14.2012 36.3513 13.5124C36.639 12.8236 36.787 12.0854 36.787 11.3399H34.0924C34.0924 13.1842 32.7354 14.6794 31.0614 14.6794C29.3872 14.6794 28.0303 12.8852 28.0303 10.6723C28.0303 8.45951 30.0664 6.66524 32.5766 6.66524C35.0878 6.66524 37.1236 8.45952 37.1236 10.6723V16.6833H39.8179V0.654297H37.1233Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M14.1758 5.95538V7.01942H21.4876L14.1758 14.2276V16.6372H25.2821V14.2276H24.6142V14.2274H18.2113L18.6109 13.7716C18.6371 13.7443 18.663 13.7167 18.6881 13.6882L19.4106 12.8695L25.2821 6.90815V4.66406H14.1758V5.95538Z"
                                                                fill="black"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="about-uzd">
                                                        <div className="subtitle">
                                                            About $UZD Stablecoin
                                                        </div>
                                                        <p>
                                                            The $UZD Stablecoin is backed by
                                                            USDC/USDT/DAI through LP tokens from
                                                            Curve/Convex & Stake DAO, which are used
                                                            in the Zunami Protocol DAO Strategy.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="subtitle">Marketcap, $</div>
                                                    <div>100 000 000</div>
                                                </div>
                                                <div>
                                                    <div className="subtitle">Backing Ratio, %</div>
                                                    <div>120</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-md-6 d-flex gap-3">
                                            <div className="panel d-flex flex-column gap-1 align-items-center links">
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Website
                                                </a>
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Docs
                                                </a>
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    CMS
                                                </a>
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Type
                                                </a>
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Governance
                                                </a>
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Audit
                                                </a>
                                            </div>
                                            <div className="panel collateral-block">
                                                <div>Collateral</div>
                                                <div>
                                                    <PieChart2
                                                        data={collateralData}
                                                        hideSummary={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <a
                                                className="twitter-timeline"
                                                href="https://twitter.com/ZunamiProtocol?ref_src=twsrc%5Etfw"
                                            >
                                                Tweets by ZunamiProtocol
                                            </a>
                                            <script
                                                async
                                                src="https://platform.twitter.com/widgets.js"
                                                charSet="utf-8"
                                            ></script>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <h2 className="mt-5">Protocol Info</h2>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="tbl">
                                                <div className="d-flex flex-wrap">
                                                    <div className="logos">
                                                        <svg
                                                            width="114"
                                                            height="25"
                                                            viewBox="0 0 114 25"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M111.206 18.134V6.28619H113.839V18.134H111.206ZM113.41 4.36631L113.447 4.32895C113.73 4.04364 113.954 3.81831 113.993 3.56982C114.006 3.48196 113.999 3.39212 113.973 3.30713C113.936 3.18119 113.868 3.09116 113.807 3.01169L113.803 3.00532C113.747 2.93321 113.686 2.86512 113.621 2.80158L113.171 2.35615C113.107 2.29152 113.038 2.23155 112.966 2.17658L112.959 2.17175C112.879 2.11217 112.789 2.04466 112.662 2.00957C112.577 1.98369 112.487 1.97766 112.399 1.99189C112.151 2.03331 111.928 2.25895 111.646 2.54463L111.609 2.58205L111.572 2.61945C111.289 2.90473 111.065 3.13007 111.026 3.37858C111.013 3.4664 111.02 3.55626 111.046 3.64125C111.083 3.76719 111.151 3.85722 111.211 3.93669L111.216 3.94306C111.272 4.01517 111.333 4.08326 111.398 4.1468L111.848 4.59223C111.912 4.65686 111.981 4.71683 112.053 4.7718L112.06 4.77663C112.14 4.83622 112.23 4.90372 112.357 4.93881C112.442 4.96469 112.532 4.97071 112.619 4.9565C112.868 4.91507 113.091 4.68941 113.373 4.40377L113.41 4.36631Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M104.159 5.95899C102.493 5.95899 100.999 6.77294 99.9739 8.06377C99.4507 7.40673 98.7856 6.87624 98.0288 6.51182C97.272 6.14739 96.4426 5.95842 95.6026 5.95899C95.1735 5.95875 94.7461 6.01354 94.331 6.12201C93.9549 6.22254 93.6066 6.40636 93.3113 6.65985C93.0163 6.91334 92.7819 7.23001 92.6258 7.58638V6.28594H91.388V6.28794H90.0078V18.1357H92.6406V12.2118C92.6406 10.0311 93.9665 8.26277 95.6026 8.26277C97.2384 8.26277 98.5645 9.73634 98.5645 11.5539V18.1357H101.197V12.2118C101.197 10.0311 102.523 8.26277 104.159 8.26277C105.795 8.26277 107.121 9.73634 107.121 11.5539V18.1357H109.754V11.5539C109.754 10.8192 109.609 10.0916 109.328 9.41281C109.047 8.73399 108.635 8.11718 108.115 7.59762C107.595 7.07809 106.979 6.66596 106.3 6.38479C105.621 6.10363 104.894 5.95895 104.159 5.95899Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M86.9636 6.28797V6.28597H85.7258V7.82917C85.4476 7.2793 84.9861 6.84392 84.4209 6.59833C83.4374 6.17354 82.3769 5.95593 81.3055 5.95902C77.3983 5.95902 74.2305 8.75824 74.2305 12.2118C74.2305 15.6649 76.7349 18.4647 79.8251 18.4647C82.9149 18.4647 85.2776 15.9602 85.2776 12.8697H82.6446C82.6446 13.7068 82.5259 14.5114 82.0627 15.0922C81.7948 15.4281 81.4543 15.6988 81.0667 15.8839C80.6792 16.069 80.2546 16.1637 79.8251 16.1609C78.189 16.1609 76.863 14.3926 76.863 12.2118C76.863 10.0311 78.8528 8.26278 81.3055 8.26278C83.7594 8.26278 85.7486 10.0311 85.7486 12.2118V18.1357H88.3814V6.28797H86.9636Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M67.7161 5.95915C66.6223 5.952 65.5393 6.17515 64.5374 6.61413C63.9789 6.86334 63.526 7.30125 63.258 7.85104V6.2861H62.0204V6.28809H60.6133V18.1359H63.2461V12.212C63.2461 10.0312 65.2356 8.26292 67.6885 8.26292C69.3243 8.26292 70.6502 9.73649 70.6502 11.5541V18.1359H73.2828V11.5709C73.2853 10.0896 72.7011 8.66763 71.6578 7.61599C70.6146 6.56434 69.1973 5.96863 67.7161 5.95915Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M56.3454 6.28906V12.213C56.3454 14.3937 54.3558 16.162 51.9033 16.162C50.2672 16.162 48.9413 14.6884 48.9413 12.8708V6.28906H46.3086V12.854C46.3063 14.3353 46.8906 15.7572 47.9338 16.8088C48.977 17.8605 50.3942 18.4562 51.8754 18.4658C52.9692 18.4729 54.0521 18.2498 55.0541 17.8108C55.613 17.5611 56.0661 17.1228 56.3342 16.5725V18.1369H58.9782V6.28906H56.3454Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M34.0352 7.56904V8.62054H41.1994L34.0352 15.7437V18.1249H44.9172V15.7437H44.2628V15.7434H37.8849L38.2765 15.293C38.3022 15.2661 38.3275 15.2387 38.3521 15.2106L39.1642 14.4016L44.9172 8.51055V6.29297H34.0352L34.0352 7.56904Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M24.9723 12.3715L24.9731 11.8546C24.9753 7.91013 24.9776 4.79446 23.5333 2.79149C23.0194 2.08639 22.3507 1.50729 21.5773 1.09894C20.454 0.47125 19.355 0.315652 18.385 0.178289L18.3068 0.167654C17.4203 0.0492469 16.527 -0.00691794 15.6329 0.000679214H9.41829C8.52419 -0.00691794 7.63086 0.0492469 6.74435 0.167654L6.66618 0.178289C5.69619 0.315652 4.59717 0.47125 3.47386 1.09894C2.70045 1.50728 2.03155 2.08639 1.51809 2.79149C0.0735048 4.79446 0.0756263 7.91013 0.0783592 11.8546L0.0785856 12.3715L0.0783592 12.8884C0.0756263 16.8328 0.0735048 19.9485 1.51817 21.9515C2.03155 22.6566 2.70045 23.2357 3.47386 23.644C4.59717 24.2717 5.69619 24.4273 6.66618 24.5647L6.74435 24.5753C7.63086 24.6937 8.52419 24.7499 9.41829 24.7423H15.6329C16.527 24.7499 17.4203 24.6937 18.3068 24.5753L18.385 24.5647C19.355 24.4273 20.454 24.2717 21.5773 23.644C22.3507 23.2357 23.0194 22.6566 23.5333 21.9515C24.9776 19.9485 24.9753 16.8328 24.9731 12.8884L24.9723 12.3715Z"
                                                                fill="black"
                                                            />
                                                            <path
                                                                d="M13.0575 17.7156C11.168 17.7156 9.4892 17.0575 8.18351 15.8005C7.30896 14.9586 6.63449 13.877 6.17886 12.5859C5.7284 11.3095 5.5 9.84472 5.5 8.23219H8.44154C8.44154 9.5065 8.61291 10.6382 8.95088 11.5959C9.25148 12.4477 9.67756 13.143 10.2173 13.6627C11.0243 14.4396 12.0597 14.8058 13.2947 14.7512C14.4329 14.7009 15.311 14.344 15.9048 13.6905C16.399 13.1466 16.6711 12.4111 16.6711 11.6197C16.6779 11.1696 16.5109 10.7344 16.2054 10.4056C16.0622 10.2538 15.8893 10.1335 15.6976 10.0523C15.5058 9.9711 15.2995 9.93076 15.0915 9.93382C14.8042 9.93599 14.5278 10.0441 14.3145 10.2377C14.1094 10.431 13.865 10.8296 13.865 11.6306H10.9235C10.9235 9.76983 11.6737 8.67193 12.303 8.07857C13.0616 7.37128 14.0571 6.97719 15.0915 6.97468C15.6965 6.97137 16.2958 7.09243 16.8526 7.33043C17.4094 7.56843 17.9121 7.91836 18.3297 8.35876C19.1571 9.22771 19.6127 10.3858 19.6127 11.6197C19.6127 13.1518 19.0669 14.5962 18.0761 15.6869C17.2924 16.5495 15.8491 17.6003 13.4239 17.7075C13.3009 17.7129 13.1788 17.7156 13.0575 17.7156Z"
                                                                fill="url(#paint0_linear_572_385)"
                                                            />
                                                            <defs>
                                                                <linearGradient
                                                                    id="paint0_linear_572_385"
                                                                    x1="15.1908"
                                                                    y1="18.6"
                                                                    x2="10.5407"
                                                                    y2="6.97461"
                                                                    gradientUnits="userSpaceOnUse"
                                                                >
                                                                    <stop stopColor="#F96402" />
                                                                    <stop
                                                                        offset="1"
                                                                        stopColor="#FFA102"
                                                                    />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </div>
                                                    <div className="about-uzd">
                                                        <div className="subtitle">
                                                            About Zunami Protocol
                                                        </div>
                                                        <p>
                                                            Zunami Protocol allows you to stake
                                                            stablecoins with the highest yield on
                                                            the market by aggregating the most
                                                            profitable DeFi protocols.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="subtitle">Native Token</div>
                                                    <div>100 000 000</div>
                                                </div>
                                                <div>
                                                    <div className="subtitle">Marketcap, $</div>
                                                    <div>120</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="mt-3 panel d-flex gap-3">
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Price, $</div>
                                                    <div>8</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Daily Volume, $</div>
                                                    <div>000</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>Market Rank</div>
                                                    <div>203</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CRV Treasury</div>
                                                    <div>0</div>
                                                </div>
                                                <div className="gray-block small-block align-items-start">
                                                    <div>CVX Treasury</div>
                                                    <div>1,400,600</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <h2 className="mt-5">Risk Assessment</h2>
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
