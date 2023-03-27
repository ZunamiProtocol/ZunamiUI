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
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';

interface PoolsStats {
    pools: Array<PoolInfo>;
}

function renderBribes(data, gaugeData) {
    const lastRound = data.votiumBribesData[0]; // current bribe
    const prevRound = data.votiumBribesData[1]; // last (previous) bribe
    
    lastRound.bribesAmount = lastRound.bribes.map(bribe => bribe.amount).reduce((a, b) => a + b, 0);
    lastRound.bribesAmountUSD = lastRound.bribes.map(bribe => bribe.amountDollars).reduce((a, b) => a + b, 0);

    prevRound.bribesAmount = prevRound.bribes.map(bribe => bribe.amount).reduce((a, b) => a + b, 0);
    prevRound.bribesAmountUSD = prevRound.bribes.map(bribe => bribe.amountDollars).reduce((a, b) => a + b, 0);

    return (
        <div>
            {
                <div className="d-flex gap-3 mb-3">
                    <div className="gray-block small-block align-items-start">
                        <div style={{ width: '145px'}}>Last bribes amount</div>
                        <div>{prevRound.bribesAmount.toFixed(0)}</div>
                    </div>
                    <div className="gray-block small-block align-items-start">
                        <div>Amount, $</div>
                        <div>{prevRound.bribesAmountUSD.toFixed(0)}</div>
                    </div>
                    {
                        prevRound.bribes.map(bribe =>
                            <div className="gray-block small-block align-items-start">
                                <div>Token</div>
                                <div>{bribe.token}</div>
                            </div>
                        )
                    }
                    <div className="gray-block small-block align-items-start">
                        <div>Current weight, %</div>
                        <div>-</div>
                    </div>
                </div>
            }
            {
                <div className="d-flex gap-3 mb-3">
                    <div className="gray-block small-block align-items-start">
                        <div style={{ width: '145px'}}>Current bribes amount</div>
                        <div>{lastRound.bribesAmount.toFixed(0)}</div>
                    </div>
                    <div className="gray-block small-block align-items-start">
                        <div>Amount, $</div>
                        <div>{lastRound.bribesAmountUSD.toFixed(0)}</div>
                    </div>
                    {
                        lastRound.bribes.map(bribe =>
                            <div className="gray-block small-block align-items-start">
                                <div>Token</div>
                                <div>{bribe.token}</div>
                            </div>
                        )
                    }
                    <div className="gray-block small-block align-items-start">
                        <div>Future weight, %</div>
                        <div>{gaugeData.crvGaugeWeightData.weight}</div>
                    </div>
                </div>
            }
        </div>
    );
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
            // console.log(chartData[0]);
        }
    }, [chartData, selectedStrat]);

    return (
        <React.Fragment>
            <MobileSidebar />
            <AllServicesPanel />
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
                        {/* <div className="card InfoBar mt-3 strats-strats">
                            <div className="card-body">
                                <div className="title">Strategies</div>
                                <div className="mt-4">QWE</div>
                            </div>
                        </div> */}
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
                                                {chartData.map((pool, poolIndex) => (
                                                    <div
                                                        className={`pool-item d-flex ${
                                                            pool.type === selectedStrat?.type
                                                                ? 'selected'
                                                                : ''
                                                        }`}
                                                        key={poolIndex}
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
                                                    {/* <div>
                                                        <div className="subtitle">Volume</div>
                                                        <div>00000000</div>
                                                    </div> */}
                                                    <div>
                                                        <div className="subtitle">TVL</div>
                                                        <div>
                                                            ${Number(
                                                                selectedStrat.tvlInUsd
                                                            ).toLocaleString('en', {
                                                                maximumFractionDigits: 0,
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="subtitle">Pool balance</div>
                                                        <div>${selectedStrat.analytics.curveData.data.usdTotal.toLocaleString('en', { maximumFractionDigits: 0 })}</div>
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
                                                <div className="col-md-4">
                                                    <div className="d-flex gap-3">
                                                        <div className="gray-block small-block">
                                                            {
                                                                selectedStrat.title
                                                                    .split(' - ')[1]
                                                                    .split(' pool')[0]
                                                            }
                                                        </div>
                                                        <div className="gray-block small-block align-items-start disabled">
                                                            <div>$350 493</div>
                                                            <div>(50%)</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    {
                                                        selectedStrat.analytics.curveData.data.underlyingCoins.map((coin, coinIndex) => 
                                                            <div className="gray-block small-block align-items-start stablecoin mb-2" key={coinIndex}>
                                                                <div>
                                                                    <img src={`https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/${coin.address.toLowerCase()}.png`} alt="" />
                                                                    <span className="name">{coin.symbol}</span>
                                                                </div>
                                                                <div className="vela-sans value">
                                                                    {(getBalanceNumber(coin.poolBalance, coin.decimals).toFixed(2) * coin.usdPrice).toLocaleString('en', { maximumFractionDigits: 0 })}
                                                                    <span> (
                                                                        {
                                                                            (getBalanceNumber(coin.poolBalance, coin.decimals).toFixed(0) / getBalanceNumber(selectedStrat.analytics.curveData.data.totalSupply).toFixed(0) * 100).toFixed(2)
                                                                        }
                                                                    %)</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {/* <div className="gray-block small-block align-items-start stablecoin mb-2">
                                                        <div>
                                                            <img src="/usdt.svg" alt="" />
                                                            <span className="name">USDT</span>
                                                        </div>
                                                        <div className="vela-sans value">
                                                            $100 000 (15%)
                                                        </div>
                                                    </div> */}
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
                                                                {selectedStrat.analytics.curveData.data.amplificationCoefficient}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStrat && (
                                        <div className="panel mt-4 disabled">
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
                                            {renderBribes(selectedStrat.analytics.bribesData, selectedStrat.analytics.gaugeData)}
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
                                                    <div className="logos uzd-logos">
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
                                        <div className="col-md-2 d-flex gap-3">
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
                                        </div>
                                        <div className="col-md-10 d-flex gap-3">
                                            <div className="panel collateral-block ms-3">
                                                <div>Collateral</div>
                                                <div>
                                                    <PieChart2
                                                        data={collateralData}
                                                        hideSummary={true}
                                                    />
                                                </div>
                                            </div>
                                            <TwitterTimelineEmbed
                                                sourceType="profile"
                                                screenName="ZunamiProtocol"
                                                options={{ height: 211, width: 450 }}
                                                // onComplete={action}
                                            />
                                            {/* <a
                                                className="twitter-timeline"
                                                href="https://twitter.com/ZunamiProtocol?ref_src=twsrc%5Etfw"
                                            >
                                                Tweets by ZunamiProtocol
                                            </a>
                                            <script
                                                async
                                                src="https://platform.twitter.com/widgets.js"
                                                charSet="utf-8"
                                            ></script> */}
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
                                                    <div className="logos protocol-logos">
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
                                    <div className="row mt-3 mb-3 risk-section">
                                        <div className="col-md-4">
                                            <ul
                                                className="nav nav-tabs flex-column"
                                                id="myTab"
                                                role="tablist"
                                            >
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className="nav-link active"
                                                        id="home-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#home-tab-pane"
                                                        type="button"
                                                        role="tab"
                                                    >
                                                        <svg
                                                            width="32"
                                                            height="22"
                                                            viewBox="0 0 32 22"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <mask
                                                                id="path-1-inside-1_576_3327"
                                                                fill="white"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M18.0904 15.3573C22.9839 15.3573 26.9509 11.157 26.9509 5.97563C26.9509 5.16847 26.8546 4.38513 26.6736 3.63776C29.5476 5.1406 31.509 8.1504 31.509 11.6183V12.1749C31.509 17.1455 27.4796 21.1749 22.509 21.1749H9.89062C4.92006 21.1749 0.890625 17.1455 0.890625 12.1749V11.6183C0.890625 6.67333 4.87872 2.65981 9.814 2.61865C9.43667 3.66098 9.22991 4.79274 9.22991 5.97563C9.22991 11.157 13.1969 15.3573 18.0904 15.3573Z"
                                                                />
                                                            </mask>
                                                            <path
                                                                d="M26.6736 3.63776L27.276 2.48575L24.7351 1.15709L25.4101 3.94382L26.6736 3.63776ZM9.814 2.61865L11.0364 3.06117L11.6728 1.30311L9.80317 1.3187L9.814 2.61865ZM25.6509 5.97563C25.6509 10.51 22.1969 14.0573 18.0904 14.0573V16.6573C23.7709 16.6573 28.2509 11.804 28.2509 5.97563H25.6509ZM25.4101 3.94382C25.567 4.59147 25.6509 5.27209 25.6509 5.97563H28.2509C28.2509 5.06485 28.1422 4.17878 27.937 3.3317L25.4101 3.94382ZM26.0712 4.78976C28.5333 6.07724 30.209 8.65316 30.209 11.6183H32.809C32.809 7.64765 30.5619 4.20396 27.276 2.48575L26.0712 4.78976ZM30.209 11.6183V12.1749H32.809V11.6183H30.209ZM30.209 12.1749C30.209 16.4275 26.7616 19.8749 22.509 19.8749V22.4749C28.1976 22.4749 32.809 17.8635 32.809 12.1749H30.209ZM22.509 19.8749H9.89062V22.4749H22.509V19.8749ZM9.89062 19.8749C5.63803 19.8749 2.19062 16.4275 2.19062 12.1749H-0.409375C-0.409375 17.8635 4.20209 22.4749 9.89062 22.4749V19.8749ZM2.19062 12.1749V11.6183H-0.409375V12.1749H2.19062ZM2.19062 11.6183C2.19062 7.38767 5.60268 3.95381 9.82484 3.91861L9.80317 1.3187C4.15476 1.3658 -0.409375 5.95899 -0.409375 11.6183H2.19062ZM10.5299 5.97563C10.5299 4.9449 10.71 3.96281 11.0364 3.06117L8.59164 2.17614C8.16337 3.35914 7.92991 4.64057 7.92991 5.97563H10.5299ZM18.0904 14.0573C13.9839 14.0573 10.5299 10.51 10.5299 5.97563H7.92991C7.92991 11.804 12.4099 16.6573 18.0904 16.6573V14.0573Z"
                                                                fill="#090909"
                                                                mask="url(#path-1-inside-1_576_3327)"
                                                            />
                                                            <circle
                                                                cx="18.0907"
                                                                cy="6.49693"
                                                                r="5.08326"
                                                                stroke="#090909"
                                                                strokeWidth="1.3"
                                                            />
                                                        </svg>
                                                        Custody Risk
                                                        <div className="circle"></div>
                                                    </button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className="nav-link"
                                                        id="profile-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#profile-tab-pane"
                                                        type="button"
                                                        role="tab"
                                                    >
                                                        <svg
                                                            width="30"
                                                            height="23"
                                                            viewBox="0 0 30 23"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <mask
                                                                id="path-1-inside-1_576_3332"
                                                                fill="white"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M6.90608 1.50862C5.57247 1.10763 4.039 1.81689 3.48099 3.0928C2.92298 4.36871 3.55172 5.72811 4.88534 6.1291L8.48823 7.21241C9.16233 7.4151 9.82929 6.8764 9.77297 6.17475L9.5147 2.95747C9.48173 2.54685 9.20034 2.19846 8.80585 2.07984L6.90608 1.50862ZM19.6019 5.32598C18.9278 5.1233 18.2608 5.66199 18.3171 6.36365L18.5754 9.58093C18.6084 9.99155 18.8898 10.3399 19.2843 10.4586L25.5599 12.3455C26.8935 12.7465 28.4269 12.0372 28.985 10.7613C29.543 9.48541 28.9142 8.12601 27.5806 7.72502L19.6019 5.32598ZM10.3424 12.2255C10.3094 11.8149 10.028 11.4665 9.63352 11.3479L4.27297 9.7361C2.93279 9.33314 1.39178 10.0459 0.831019 11.3281C0.27026 12.6103 0.902105 13.9764 2.24228 14.3793L9.31802 16.5069C9.99212 16.7095 10.6591 16.1708 10.6028 15.4692L10.3424 12.2255ZM19.3061 18.8456C19.339 19.2562 19.6204 19.6046 20.0149 19.7232L22.893 20.5886C24.2332 20.9915 25.7742 20.2788 26.335 18.9966C26.8957 17.7144 26.2639 16.3483 24.9237 15.9454L20.3304 14.5642C19.6563 14.3616 18.9894 14.9003 19.0457 15.6019L19.3061 18.8456ZM16.26 2.46069C16.1476 1.06088 14.9436 0.165796 13.5708 0.461468C12.1979 0.757139 11.1761 2.1316 11.2885 3.53141L12.6552 20.5566C12.7676 21.9564 13.9716 22.8515 15.3444 22.5559C16.7173 22.2602 17.7391 20.8857 17.6267 19.4859L16.26 2.46069Z"
                                                                />
                                                            </mask>
                                                            <path
                                                                d="M3.48099 3.0928L2.28992 2.57189L2.28991 2.57189L3.48099 3.0928ZM6.90608 1.50862L6.53175 2.75356L6.53175 2.75356L6.90608 1.50862ZM4.88534 6.1291L4.51101 7.37404L4.51101 7.37404L4.88534 6.1291ZM8.48823 7.21241L8.86256 5.96747L8.48823 7.21241ZM9.77297 6.17475L11.0688 6.07072L11.0688 6.07072L9.77297 6.17475ZM9.5147 2.95747L8.21887 3.06149L8.21887 3.06149L9.5147 2.95747ZM8.80585 2.07984L9.18018 0.834902L9.18018 0.834901L8.80585 2.07984ZM18.3171 6.36365L17.0213 6.46767L17.0213 6.46767L18.3171 6.36365ZM19.6019 5.32598L19.2275 6.57093L19.6019 5.32598ZM18.5754 9.58093L17.2796 9.68495L17.2796 9.68495L18.5754 9.58093ZM19.2843 10.4586L18.9099 11.7035L18.9099 11.7035L19.2843 10.4586ZM25.5599 12.3455L25.9342 11.1006L25.9342 11.1006L25.5599 12.3455ZM28.985 10.7613L30.176 11.2822L30.176 11.2822L28.985 10.7613ZM27.5806 7.72502L27.9549 6.48008L27.9549 6.48008L27.5806 7.72502ZM9.63352 11.3479L10.0078 10.103L10.0078 10.103L9.63352 11.3479ZM10.3424 12.2255L9.04654 12.3296L10.3424 12.2255ZM4.27297 9.7361L3.89865 10.981L3.89865 10.981L4.27297 9.7361ZM0.831019 11.3281L-0.360053 10.8072L-0.360053 10.8072L0.831019 11.3281ZM2.24228 14.3793L1.86796 15.6243L2.24228 14.3793ZM9.31802 16.5069L9.69235 15.2619L9.31802 16.5069ZM10.6028 15.4692L9.30692 15.5732L9.30692 15.5732L10.6028 15.4692ZM20.0149 19.7232L20.3893 18.4783L20.3893 18.4783L20.0149 19.7232ZM19.3061 18.8456L20.6019 18.7415L20.6019 18.7415L19.3061 18.8456ZM22.893 20.5886L22.5187 21.8335L22.5187 21.8335L22.893 20.5886ZM26.335 18.9966L25.1439 18.4757L25.1439 18.4757L26.335 18.9966ZM24.9237 15.9454L24.5494 17.1903L24.9237 15.9454ZM20.3304 14.5642L20.7048 13.3193L20.7048 13.3193L20.3304 14.5642ZM19.0457 15.6019L17.7499 15.7059L17.7499 15.7059L19.0457 15.6019ZM16.26 2.46069L14.9641 2.56472L16.26 2.46069ZM11.2885 3.53141L12.5843 3.42739L12.5843 3.42739L11.2885 3.53141ZM12.6552 20.5566L11.3594 20.6606L11.3594 20.6607L12.6552 20.5566ZM15.3444 22.5559L15.0707 21.285L15.3444 22.5559ZM17.6267 19.4859L16.3309 19.5899L16.3309 19.5899L17.6267 19.4859ZM4.67206 3.61371C4.96654 2.94037 5.82796 2.54195 6.53175 2.75356L7.28041 0.26368C5.31697 -0.326686 3.11146 0.693413 2.28992 2.57189L4.67206 3.61371ZM5.25967 4.88416C4.67281 4.7077 4.42651 4.17518 4.67206 3.61371L2.28991 2.57189C1.41945 4.56224 2.43064 6.74851 4.51101 7.37404L5.25967 4.88416ZM8.86256 5.96747L5.25967 4.88416L4.51101 7.37404L8.1139 8.45735L8.86256 5.96747ZM8.47714 6.27877C8.46024 6.06827 8.66033 5.90666 8.86256 5.96747L8.1139 8.45735C9.66433 8.92354 11.1983 7.68453 11.0688 6.07072L8.47714 6.27877ZM8.21887 3.06149L8.47714 6.27877L11.0688 6.07072L10.8105 2.85344L8.21887 3.06149ZM8.43152 3.32478C8.31317 3.2892 8.22875 3.18468 8.21887 3.06149L10.8105 2.85345C10.7347 1.90902 10.0875 1.10772 9.18018 0.834902L8.43152 3.32478ZM6.53175 2.75356L8.43152 3.32478L9.18018 0.834901L7.28041 0.26368L6.53175 2.75356ZM19.613 6.25963C19.6299 6.47012 19.4298 6.63173 19.2275 6.57093L19.9762 4.08104C18.4258 3.61486 16.8918 4.85386 17.0213 6.46767L19.613 6.25963ZM19.8712 9.4769L19.613 6.25963L17.0213 6.46767L17.2796 9.68495L19.8712 9.4769ZM19.6586 9.21361C19.7769 9.2492 19.8613 9.35371 19.8712 9.4769L17.2796 9.68495C17.3554 10.6294 18.0026 11.4307 18.9099 11.7035L19.6586 9.21361ZM25.9342 11.1006L19.6586 9.21361L18.9099 11.7035L25.1855 13.5904L25.9342 11.1006ZM27.7939 10.2404C27.4994 10.9137 26.638 11.3122 25.9342 11.1006L25.1855 13.5904C27.149 14.1808 29.3545 13.1607 30.176 11.2822L27.7939 10.2404ZM27.2063 8.96996C27.7931 9.14642 28.0394 9.67894 27.7939 10.2404L30.176 11.2822C31.0465 9.29188 30.0353 7.10561 27.9549 6.48008L27.2063 8.96996ZM19.2275 6.57093L27.2063 8.96996L27.9549 6.48008L19.9762 4.08104L19.2275 6.57093ZM9.25919 12.5928C9.14084 12.5573 9.05642 12.4527 9.04654 12.3296L11.6382 12.1215C11.5624 11.1771 10.9152 10.3758 10.0078 10.103L9.25919 12.5928ZM3.89865 10.981L9.25919 12.5928L10.0078 10.103L4.6473 8.49116L3.89865 10.981ZM2.02209 11.849C2.31932 11.1694 3.18829 10.7675 3.89865 10.981L4.6473 8.49116C2.6773 7.89882 0.464239 8.92241 -0.360053 10.8072L2.02209 11.849ZM2.61661 13.1344C2.02319 12.956 1.77379 12.4167 2.02209 11.849L-0.360053 10.8072C-1.23327 12.8038 -0.218979 14.9968 1.86796 15.6243L2.61661 13.1344ZM9.69235 15.2619L2.61661 13.1344L1.86796 15.6243L8.94369 17.7518L9.69235 15.2619ZM9.30692 15.5732C9.29003 15.3627 9.49012 15.2011 9.69235 15.2619L8.94369 17.7518C10.4941 18.218 12.0281 16.979 11.8986 15.3652L9.30692 15.5732ZM9.04654 12.3296L9.30692 15.5732L11.8986 15.3652L11.6382 12.1215L9.04654 12.3296ZM20.3893 18.4783C20.5076 18.5138 20.592 18.6184 20.6019 18.7415L18.0103 18.9496C18.0861 19.894 18.7333 20.6953 19.6406 20.9681L20.3893 18.4783ZM23.2674 19.3436L20.3893 18.4783L19.6406 20.9681L22.5187 21.8335L23.2674 19.3436ZM25.1439 18.4757C24.8467 19.1553 23.9777 19.5572 23.2674 19.3436L22.5187 21.8335C24.4887 22.4259 26.7018 21.4023 27.5261 19.5175L25.1439 18.4757ZM24.5494 17.1903C25.1428 17.3687 25.3922 17.9079 25.1439 18.4757L27.5261 19.5175C28.3993 17.5209 27.385 15.3279 25.298 14.7004L24.5494 17.1903ZM19.9561 15.8092L24.5494 17.1903L25.298 14.7004L20.7048 13.3193L19.9561 15.8092ZM20.3415 15.4979C20.3584 15.7084 20.1583 15.87 19.9561 15.8092L20.7048 13.3193C19.1543 12.8531 17.6203 14.0921 17.7499 15.7059L20.3415 15.4979ZM20.6019 18.7415L20.3415 15.4979L17.7499 15.7059L18.0103 18.9496L20.6019 18.7415ZM13.8445 1.73233C14.449 1.60213 14.9147 1.94834 14.9641 2.56472L17.5558 2.35667C17.3805 0.173423 15.4382 -1.27054 13.2971 -0.809392L13.8445 1.73233ZM12.5843 3.42739C12.5241 2.67731 13.1088 1.89076 13.8445 1.73233L13.2971 -0.809392C11.287 -0.376482 9.82813 1.58589 9.99266 3.63544L12.5843 3.42739ZM13.951 20.4526L12.5843 3.42739L9.99266 3.63544L11.3594 20.6606L13.951 20.4526ZM15.0707 21.285C14.4662 21.4152 14.0005 21.069 13.951 20.4526L11.3594 20.6607C11.5346 22.8439 13.477 24.2879 15.6181 23.8267L15.0707 21.285ZM16.3309 19.5899C16.3911 20.34 15.8063 21.1266 15.0707 21.285L15.6181 23.8267C17.6282 23.3938 19.0871 21.4314 18.9225 19.3819L16.3309 19.5899ZM14.9641 2.56472L16.3309 19.5899L18.9225 19.3819L17.5558 2.35667L14.9641 2.56472Z"
                                                                fill="#090909"
                                                                mask="url(#path-1-inside-1_576_3332)"
                                                            />
                                                        </svg>
                                                        Depeg Risk
                                                        <div className="circle"></div>
                                                    </button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className="nav-link"
                                                        id="contact-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#contact-tab-pane"
                                                        type="button"
                                                        role="tab"
                                                    >
                                                        <svg
                                                            width="28"
                                                            height="23"
                                                            viewBox="0 0 28 23"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M15.4912 12.338C15.4913 12.3378 15.4915 12.3377 15.4917 12.3375L15.4912 12.338ZM16.9873 8.49744L17.5509 8.82114L16.9873 8.49744L14.958 12.031C14.7291 12.4296 14.8001 12.8827 15.0231 13.1816C15.1368 13.334 15.3177 13.483 15.5637 13.536C15.8285 13.593 16.0889 13.5207 16.2915 13.3624L20.6896 9.92602C21.2395 9.49644 21.4352 8.74141 21.289 8.08958L20.8727 6.23405C20.8023 5.92016 20.9665 5.71929 21.0308 5.68973L22.7716 4.88946L25.994 5.5016C26.4321 5.58483 26.8414 5.92157 27.1008 6.46854C27.3585 7.01207 27.4352 7.70594 27.2411 8.37355L27.2109 8.4763C25.8995 12.9005 23.5055 15.4796 21.952 17.1106C19.1777 20.0232 16.315 21.5004 14.2541 22.2749C13.9767 22.3792 13.6861 22.3751 13.4078 22.2613C10.5324 21.0862 3.28046 17.4637 0.869611 9.03833C0.824942 8.88222 0.78146 8.72282 0.739357 8.56011C0.566535 7.89221 0.654837 7.21233 0.914426 6.68448C1.17535 6.15392 1.5782 5.82844 2.00994 5.74662C3.91712 5.38518 6.13764 4.73406 8.51416 3.57266C10.1944 2.75155 11.6561 1.82024 12.8977 0.902477C13.3766 0.548528 13.9556 0.564108 14.4443 0.966319C15.0098 1.43172 15.6693 1.90326 16.425 2.33089C16.998 2.65522 17.5478 2.90986 18.0603 3.11074L16.6446 4.22641C15.9557 4.76932 15.8278 5.81097 16.2337 6.54607L16.9909 7.9174C17.0844 8.08679 17.0819 8.3327 16.9873 8.49744Z"
                                                                stroke="#090909"
                                                                strokeWidth="1.3"
                                                            />
                                                        </svg>
                                                        Collateral Risk
                                                        <div className="circle"></div>
                                                    </button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button
                                                        className="nav-link"
                                                        id="contract-risk-tab"
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#contract-risk-tab-pane"
                                                        type="button"
                                                        role="tab"
                                                    >
                                                        <svg
                                                            width="35"
                                                            height="37"
                                                            viewBox="0 0 35 37"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <mask
                                                                id="path-1-inside-1_576_3344"
                                                                fill="white"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M14.2884 7.07459C14.4351 7.90217 15.2444 8.4932 16.1655 8.4932C16.263 8.4932 16.362 8.48656 16.4614 8.47285C17.4993 8.32984 18.2093 7.47209 18.0472 6.55684L17.2931 2.30041C17.1309 1.38524 16.1582 0.759301 15.1202 0.902144C14.0823 1.04516 13.3723 1.90291 13.5344 2.81816L14.2884 7.07459ZM13.0588 11.8739C12.5008 11.8739 11.948 11.6584 11.5722 11.2443L8.76906 8.15466C8.11285 7.43131 8.24581 6.37588 9.06618 5.79718C9.88644 5.21874 11.0835 5.33572 11.7398 6.05916L14.543 9.14879C15.1992 9.87215 15.0662 10.9276 14.2459 11.5063C13.8952 11.7536 13.4755 11.8739 13.0588 11.8739ZM19.18 24.079C19.5307 24.8584 20.3781 25.3333 21.2745 25.3333C21.5509 25.3333 21.8319 25.2881 22.1045 25.1927C22.8852 24.9196 24.1797 24.4314 25.5503 23.9144L25.571 23.9066C26.8463 23.4257 28.1613 22.9298 28.8819 22.6776C28.9377 22.658 28.9928 22.6366 29.0467 22.6131C29.7014 22.3286 31.2965 21.4716 31.9657 19.6617C32.5643 18.0425 32.0351 16.6573 31.7303 16.0623L31.5299 15.6023L33.0729 15C34.0336 14.625 34.4675 13.6343 34.0422 12.7873C33.617 11.9404 32.4935 11.5572 31.5329 11.9327L30.1194 12.4845C29.3726 11.2997 27.9018 10.0049 25.7889 9.61831C23.9801 9.28748 22.8962 9.6753 21.6408 10.1245L21.6404 10.1246L21.5938 10.1413L21.5935 10.1413C21.4621 10.1883 21.3227 10.2381 21.1733 10.2904C20.017 10.6949 19.4516 11.8495 19.9105 12.8691C20.3693 13.8886 21.6785 14.3875 22.8351 13.9826C23.0109 13.9211 23.1739 13.8628 23.3267 13.8082L23.3339 13.8056C24.4051 13.4223 24.4228 13.4255 24.8731 13.5078L24.8736 13.5078C25.3662 13.598 25.7211 13.8772 25.9432 14.1147L20.3528 16.297C19.3921 16.6719 18.9582 17.6626 19.3834 18.5096C19.6979 19.136 20.3939 19.5083 21.1239 19.5083C21.381 19.5083 21.6425 19.462 21.8928 19.3643L27.4053 17.2124L27.5517 17.5485C27.5729 17.5973 27.5964 17.6453 27.6219 17.6925C27.655 17.7535 27.8134 18.0762 27.6825 18.4304C27.5584 18.766 27.238 18.9584 27.1074 19.025C26.3192 19.3039 25.0835 19.7699 23.7786 20.2621C22.4953 20.7461 21.1682 21.2467 20.4431 21.5004C19.2867 21.9049 18.7212 23.0595 19.18 24.079ZM11.7568 28.4433C12.1314 28.4961 12.4744 28.5198 12.7936 28.5198C14.0606 28.5197 14.9519 28.1456 15.9519 27.7258L15.9609 27.7221C16.103 27.6624 16.2545 27.5987 16.4181 27.5314C17.5454 27.0676 18.0329 25.8858 17.5067 24.8917C16.9807 23.8977 15.6403 23.4678 14.513 23.9318C14.3402 24.0029 14.1798 24.0702 14.0293 24.1333L14.0153 24.1392C12.9462 24.5879 12.9284 24.5857 12.4666 24.5206C11.6419 24.4046 11.1484 23.7469 11.0323 23.5746L10.9655 23.4383L11.7988 23.1284C12.7668 22.7685 13.2205 21.7848 12.8124 20.9313C12.4042 20.0778 11.2883 19.6776 10.3206 20.0376L9.45493 20.3594C9.437 20.3249 9.418 20.2908 9.39783 20.2573C9.35638 20.1881 9.15625 19.822 9.28335 19.3995C9.39998 19.0117 9.72506 18.7867 9.86828 18.7038L14.2656 16.8943C15.393 16.4304 15.8805 15.2486 15.3543 14.2546C14.8282 13.2605 13.4879 12.8306 12.3606 13.2947L7.85546 15.1484C7.80012 15.1712 7.74586 15.1959 7.69277 15.2226C7.05035 15.5453 5.49488 16.4994 4.9289 18.3809C4.4584 19.9442 4.95569 21.2568 5.29779 21.9052L2.01116 23.1272C1.04317 23.4871 0.589436 24.4708 0.997614 25.3243C1.30402 25.9651 2.00901 26.3503 2.75106 26.3503C2.99753 26.3503 3.24811 26.3078 3.4894 26.218L6.81411 24.9818L6.94075 25.2401C6.96236 25.2841 6.98572 25.3274 7.01085 25.3699C7.76102 26.6384 9.40164 28.112 11.7568 28.4433ZM26.444 32.6188C25.7729 32.6188 25.1225 32.3051 24.776 31.7501L22.612 28.2839C22.1054 27.4723 22.4408 26.4524 23.361 26.0057C24.2812 25.5588 25.4381 25.8546 25.9447 26.6661L28.1087 30.1323C28.6153 30.9439 28.28 31.9638 27.3597 32.4105C27.0689 32.5517 26.7541 32.6188 26.444 32.6188ZM20.4515 36.3235L20.4837 36.3238C21.5194 36.3238 22.3676 35.591 22.3848 34.6743L22.4658 30.3669C22.4832 29.4408 21.6458 28.6776 20.5954 28.6622C19.5472 28.6468 18.6795 29.3852 18.6621 30.3114L18.5811 34.6188C18.5637 35.5449 19.4011 36.3082 20.4515 36.3235Z"
                                                                />
                                                            </mask>
                                                            <path
                                                                d="M14.2884 7.07459L13.0084 7.30137L13.0084 7.30142L14.2884 7.07459ZM16.4614 8.47285L16.284 7.18502L16.2839 7.18503L16.4614 8.47285ZM18.0472 6.55684L19.3273 6.33012L19.3273 6.33006L18.0472 6.55684ZM17.2931 2.30041L18.5732 2.07363L18.5732 2.07354L17.2931 2.30041ZM15.1202 0.902144L14.9429 -0.385721L14.9427 -0.385687L15.1202 0.902144ZM13.5344 2.81816L12.2543 3.04487L12.2543 3.04494L13.5344 2.81816ZM11.5722 11.2443L12.535 10.3708L12.535 10.3708L11.5722 11.2443ZM8.76906 8.15466L7.80622 9.02813L7.80628 9.02818L8.76906 8.15466ZM9.06618 5.79718L8.31698 4.73478L8.31681 4.73489L9.06618 5.79718ZM11.7398 6.05916L10.777 6.93264L10.777 6.93269L11.7398 6.05916ZM14.543 9.14879L15.5058 8.27533L15.5058 8.27527L14.543 9.14879ZM14.2459 11.5063L14.9951 12.5686L14.9952 12.5686L14.2459 11.5063ZM19.18 24.079L20.3655 23.5456L20.3655 23.5456L19.18 24.079ZM22.1045 25.1927L22.5337 26.4198L22.5338 26.4198L22.1045 25.1927ZM25.5503 23.9144L25.0916 22.698L25.0915 22.698L25.5503 23.9144ZM25.571 23.9066L26.0297 25.123L26.0297 25.123L25.571 23.9066ZM28.8819 22.6776L29.3113 23.9046L29.312 23.9044L28.8819 22.6776ZM29.0467 22.6131L28.5286 21.4208L28.5278 21.4211L29.0467 22.6131ZM31.9657 19.6617L33.185 20.1125L33.185 20.1125L31.9657 19.6617ZM31.7303 16.0623L30.5385 16.5816L30.5547 16.6189L30.5733 16.6551L31.7303 16.0623ZM31.5299 15.6023L31.0571 14.3913L29.7983 14.8827L30.3381 16.1216L31.5299 15.6023ZM33.0729 15L32.6002 13.789L32.6002 13.789L33.0729 15ZM34.0422 12.7873L32.8804 13.3706L32.8804 13.3707L34.0422 12.7873ZM31.5329 11.9327L32.0056 13.1437L32.0062 13.1434L31.5329 11.9327ZM30.1194 12.4845L29.0197 13.1777L29.5922 14.0858L30.5922 13.6955L30.1194 12.4845ZM25.7889 9.61831L26.0229 8.33954L26.0228 8.33952L25.7889 9.61831ZM21.6408 10.1245L22.0769 11.3491L22.0787 11.3485L21.6408 10.1245ZM21.6404 10.1246L21.2044 8.89991L21.2031 8.90034L21.6404 10.1246ZM21.5938 10.1413L22.0272 11.3669L22.031 11.3655L21.5938 10.1413ZM21.5935 10.1413L21.1601 8.91573L21.1562 8.91711L21.5935 10.1413ZM21.1733 10.2904L21.6026 11.5174L21.6027 11.5174L21.1733 10.2904ZM19.9105 12.8691L21.096 12.3356L21.096 12.3356L19.9105 12.8691ZM22.8351 13.9826L22.4056 12.7556L22.4056 12.7556L22.8351 13.9826ZM23.3267 13.8082L22.8893 12.584L22.8892 12.584L23.3267 13.8082ZM23.3339 13.8056L23.7713 15.0298L23.7719 15.0296L23.3339 13.8056ZM24.8731 13.5078L25.107 12.229L25.1066 12.2289L24.8731 13.5078ZM24.8736 13.5078L25.1076 12.2291L25.1075 12.2291L24.8736 13.5078ZM25.9432 14.1147L26.416 15.3257L28.2035 14.6279L26.8926 13.2266L25.9432 14.1147ZM20.3528 16.297L20.8254 17.5081L20.8255 17.508L20.3528 16.297ZM19.3834 18.5096L18.2216 19.0928L18.2216 19.093L19.3834 18.5096ZM21.8928 19.3643L22.3654 20.5754L22.3655 20.5753L21.8928 19.3643ZM27.4053 17.2124L28.5971 16.6932L28.0975 15.5467L26.9325 16.0014L27.4053 17.2124ZM27.5517 17.5485L28.7439 17.0302L28.7435 17.0292L27.5517 17.5485ZM27.6219 17.6925L26.4786 18.3112L26.4795 18.3128L27.6219 17.6925ZM27.6825 18.4304L28.9019 18.8812L28.9019 18.881L27.6825 18.4304ZM27.1074 19.025L27.5411 20.2506L27.6221 20.2219L27.6986 20.1829L27.1074 19.025ZM23.7786 20.2621L23.3198 19.0457L23.3198 19.0457L23.7786 20.2621ZM20.4431 21.5004L20.8724 22.7274L20.8724 22.7274L20.4431 21.5004ZM12.7936 28.5198V29.8198H12.7937L12.7936 28.5198ZM11.7568 28.4433L11.938 27.156L11.9378 27.156L11.7568 28.4433ZM15.9519 27.7258L15.4488 26.5271L15.4487 26.5272L15.9519 27.7258ZM15.9609 27.7221L16.464 28.9207L16.4643 28.9206L15.9609 27.7221ZM16.4181 27.5314L16.9127 28.7336L16.9128 28.7336L16.4181 27.5314ZM17.5067 24.8917L16.3577 25.4997L16.3578 25.4999L17.5067 24.8917ZM14.513 23.9318L15.0073 25.1342L15.0079 25.1339L14.513 23.9318ZM14.0293 24.1333L13.5263 22.9346H13.5263L14.0293 24.1333ZM14.0153 24.1392L13.5122 22.9405L13.5122 22.9405L14.0153 24.1392ZM12.4666 24.5206L12.6481 23.2333L12.6477 23.2333L12.4666 24.5206ZM11.0323 23.5746L9.86511 24.147L9.90441 24.2271L9.95429 24.3011L11.0323 23.5746ZM10.9655 23.4383L10.5124 22.2198L9.16554 22.7206L9.79827 24.0107L10.9655 23.4383ZM11.7988 23.1284L11.3458 21.9099L11.3457 21.9099L11.7988 23.1284ZM12.8124 20.9313L13.9852 20.3704V20.3704L12.8124 20.9313ZM10.3206 20.0376L10.7736 21.2561L10.7738 21.256L10.3206 20.0376ZM9.45493 20.3594L8.30099 20.9581L8.83043 21.9786L9.90799 21.5779L9.45493 20.3594ZM9.39783 20.2573L8.28287 20.9258L8.28374 20.9272L9.39783 20.2573ZM9.28335 19.3995L10.5282 19.774L10.5283 19.7739L9.28335 19.3995ZM9.86828 18.7038L9.37357 17.5016L9.2929 17.5348L9.21739 17.5785L9.86828 18.7038ZM14.2656 16.8943L13.771 15.6921L13.7709 15.6921L14.2656 16.8943ZM15.3543 14.2546L14.2053 14.8627L14.2053 14.8627L15.3543 14.2546ZM12.3606 13.2947L12.8552 14.4969L12.8554 14.4968L12.3606 13.2947ZM7.85546 15.1484L8.34993 16.3507L8.35015 16.3506L7.85546 15.1484ZM7.69277 15.2226L7.10974 14.0606L7.10917 14.0609L7.69277 15.2226ZM4.9289 18.3809L6.17375 18.7556L6.1738 18.7554L4.9289 18.3809ZM5.29779 21.9052L5.75085 23.1237L7.13836 22.6078L6.44755 21.2985L5.29779 21.9052ZM2.01116 23.1272L2.46422 24.3457L2.46423 24.3457L2.01116 23.1272ZM0.997614 25.3243L2.17043 24.7635L2.1704 24.7635L0.997614 25.3243ZM3.4894 26.218L3.03634 24.9996L3.03623 24.9996L3.4894 26.218ZM6.81411 24.9818L7.98131 24.4094L7.46344 23.3535L6.36105 23.7633L6.81411 24.9818ZM6.94075 25.2401L5.77356 25.8125L5.77359 25.8126L6.94075 25.2401ZM7.01085 25.3699L5.8918 26.0315L5.89187 26.0316L7.01085 25.3699ZM24.776 31.7501L25.8788 31.0616L25.8788 31.0616L24.776 31.7501ZM22.612 28.2839L21.5093 28.9723L21.5093 28.9723L22.612 28.2839ZM23.361 26.0057L23.9287 27.1752L23.929 27.1751L23.361 26.0057ZM25.9447 26.6661L24.842 27.3546L24.842 27.3546L25.9447 26.6661ZM28.1087 30.1323L29.2115 29.4439L29.2114 29.4439L28.1087 30.1323ZM27.3597 32.4105L26.792 31.241L26.792 31.241L27.3597 32.4105ZM20.4837 36.3238L20.4732 37.6238H20.4837V36.3238ZM20.4515 36.3235L20.4325 37.6234L20.441 37.6235L20.4515 36.3235ZM22.3848 34.6743L21.0851 34.6499V34.6499L22.3848 34.6743ZM22.4658 30.3669L23.7656 30.3914V30.3914L22.4658 30.3669ZM20.5954 28.6622L20.5763 29.9621L20.5764 29.9621L20.5954 28.6622ZM18.6621 30.3114L19.9618 30.3359V30.3358L18.6621 30.3114ZM18.5811 34.6188L17.2813 34.5944L18.5811 34.6188ZM16.1655 7.1932C15.9797 7.1932 15.8216 7.13278 15.7153 7.05329C15.6114 6.97556 15.5775 6.89839 15.5685 6.84776L13.0084 7.30142C13.2862 8.8691 14.7434 9.7932 16.1655 9.7932V7.1932ZM16.2839 7.18503C16.2437 7.19057 16.2041 7.1932 16.1655 7.1932V9.7932C16.322 9.7932 16.4802 9.78255 16.6389 9.76068L16.2839 7.18503ZM16.7671 6.78355C16.7756 6.83141 16.7695 6.89502 16.7028 6.97555C16.6325 7.06052 16.4949 7.15596 16.284 7.18502L16.6389 9.76069C18.2491 9.5388 19.6442 8.11978 19.3273 6.33012L16.7671 6.78355ZM16.0131 2.52719L16.7671 6.78361L19.3273 6.33006L18.5732 2.07363L16.0131 2.52719ZM15.2974 2.19001C15.5096 2.1608 15.6999 2.21296 15.8316 2.29774C15.9625 2.38199 16.0034 2.47269 16.0131 2.52727L18.5732 2.07354C18.2657 0.338566 16.5318 -0.604353 14.9429 -0.385721L15.2974 2.19001ZM14.8145 2.59145C14.806 2.54359 14.8121 2.47998 14.8787 2.39945C14.9491 2.31448 15.0867 2.21904 15.2976 2.18997L14.9427 -0.385687C13.3325 -0.163804 11.9373 1.25522 12.2543 3.04487L14.8145 2.59145ZM15.5685 6.84781L14.8144 2.59138L12.2543 3.04494L13.0084 7.30137L15.5685 6.84781ZM10.6094 12.1178C11.2615 12.8366 12.1812 13.1739 13.0588 13.1739V10.5739C12.8204 10.5739 12.6344 10.4803 12.535 10.3708L10.6094 12.1178ZM7.80628 9.02818L10.6095 12.1178L12.535 10.3708L9.73185 7.28114L7.80628 9.02818ZM8.31681 4.73489C6.89172 5.74019 6.59822 7.69652 7.80622 9.02813L9.7319 7.2812C9.65424 7.19559 9.64822 7.12769 9.6537 7.08421C9.65957 7.03768 9.68919 6.9486 9.81554 6.85947L8.31681 4.73489ZM12.7026 5.18568C11.5862 3.95506 9.65031 3.79452 8.31698 4.73478L9.81537 6.85959C10.1226 6.64296 10.5808 6.71638 10.777 6.93264L12.7026 5.18568ZM15.5058 8.27527L12.7026 5.18564L10.777 6.93269L13.5802 10.0223L15.5058 8.27527ZM14.9952 12.5686C16.4203 11.5633 16.7138 9.60694 15.5058 8.27533L13.5801 10.0223C13.6578 10.1079 13.6638 10.1758 13.6583 10.2192C13.6525 10.2658 13.6229 10.3549 13.4965 10.444L14.9952 12.5686ZM13.0588 13.1739C13.7208 13.1739 14.4072 12.9833 14.9951 12.5686L13.4966 10.4439C13.3832 10.5239 13.2301 10.5739 13.0588 10.5739V13.1739ZM21.2745 24.0333C20.7989 24.0333 20.4714 23.7808 20.3655 23.5456L17.9945 24.6125C18.59 25.9359 19.9574 26.6333 21.2745 26.6333V24.0333ZM21.6753 23.9656C21.545 24.0112 21.4094 24.0333 21.2745 24.0333V26.6333C21.6923 26.6333 22.1188 26.565 22.5337 26.4198L21.6753 23.9656ZM25.0915 22.698C23.7131 23.218 22.4372 23.6991 21.6752 23.9657L22.5338 26.4198C23.3332 26.1402 24.6463 25.6448 26.0091 25.1307L25.0915 22.698ZM25.1123 22.6902L25.0916 22.698L26.009 25.1308L26.0297 25.123L25.1123 22.6902ZM28.4525 21.4505C27.7132 21.7093 26.3792 22.2124 25.1123 22.6902L26.0297 25.123C27.3133 24.6389 28.6093 24.1503 29.3113 23.9046L28.4525 21.4505ZM28.5278 21.4211C28.5048 21.4312 28.4795 21.4411 28.4519 21.4508L29.312 23.9044C29.396 23.8749 29.4808 23.842 29.5655 23.8051L28.5278 21.4211ZM30.7464 19.2108C30.2637 20.5161 29.0778 21.1822 28.5286 21.4208L29.5647 23.8054C30.325 23.4751 32.3292 22.427 33.185 20.1125L30.7464 19.2108ZM30.5733 16.6551C30.8004 17.0984 31.1645 18.0798 30.7464 19.2109L33.185 20.1125C33.9641 18.0053 33.2698 16.2162 32.8873 15.4695L30.5733 16.6551ZM30.3381 16.1216L30.5385 16.5816L32.9221 15.5431L32.7217 15.0831L30.3381 16.1216ZM32.6002 13.789L31.0571 14.3913L32.0026 16.8133L33.5457 16.211L32.6002 13.789ZM32.8804 13.3707C32.9132 13.436 32.9124 13.4899 32.8865 13.549C32.8577 13.6149 32.7787 13.7193 32.6002 13.789L33.5457 16.211C35.1065 15.6017 36.0251 13.8393 35.204 12.204L32.8804 13.3707ZM32.0062 13.1434C32.4262 12.9793 32.7956 13.2017 32.8804 13.3706L35.204 12.204C34.4384 10.6792 32.5607 10.1351 31.0596 10.7219L32.0062 13.1434ZM30.5922 13.6955L32.0056 13.1437L31.0602 10.7217L29.6467 11.2735L30.5922 13.6955ZM25.5549 10.8971C27.2604 11.2092 28.4381 12.2552 29.0197 13.1777L31.2191 11.7912C30.307 10.3443 28.5433 8.80073 26.0229 8.33954L25.5549 10.8971ZM22.0787 11.3485C23.2915 10.9146 24.1006 10.6311 25.555 10.8971L26.0228 8.33952C23.8595 7.94387 22.5008 8.43603 21.2028 8.90045L22.0787 11.3485ZM22.0765 11.3493L22.0769 11.3491L21.2047 8.89978L21.2044 8.89991L22.0765 11.3493ZM22.031 11.3655L22.0777 11.3489L21.2031 8.90034L21.1565 8.91701L22.031 11.3655ZM22.027 11.367L22.0272 11.3669L21.1603 8.91565L21.1601 8.91574L22.027 11.367ZM21.6027 11.5174C21.7566 11.4636 21.8998 11.4124 22.0308 11.3656L21.1562 8.91711C21.0244 8.96421 20.8887 9.01265 20.7439 9.06333L21.6027 11.5174ZM21.096 12.3356C21.0324 12.1943 21.0376 12.0559 21.1037 11.9208C21.1732 11.779 21.3278 11.6136 21.6026 11.5174L20.744 9.06331C18.9912 9.67656 17.9022 11.5745 18.7251 13.4027L21.096 12.3356ZM22.4056 12.7556C21.791 12.9707 21.2386 12.6525 21.096 12.3356L18.7251 13.4027C19.5001 15.1247 21.566 15.8042 23.2647 15.2096L22.4056 12.7556ZM22.8892 12.584C22.7361 12.6387 22.5768 12.6957 22.4056 12.7556L23.2647 15.2096C23.445 15.1464 23.6118 15.0868 23.7642 15.0324L22.8892 12.584ZM22.8965 12.5814L22.8893 12.584L23.7641 15.0324L23.7713 15.0298L22.8965 12.5814ZM25.1066 12.2289C24.8805 12.1876 24.5498 12.1186 24.0946 12.2048C23.7739 12.2654 23.3824 12.4075 22.8959 12.5816L23.7719 15.0296C24.0432 14.9325 24.2285 14.8669 24.3686 14.8209C24.5119 14.7738 24.5649 14.7619 24.578 14.7594C24.5799 14.7591 24.5688 14.7612 24.5492 14.7624C24.5287 14.7637 24.511 14.7631 24.5 14.7623C24.4967 14.7621 24.5071 14.7624 24.6396 14.7866L25.1066 12.2289ZM25.1075 12.2291L25.107 12.229L24.6392 14.7865L24.6396 14.7866L25.1075 12.2291ZM26.8926 13.2266C26.5566 12.8674 25.9671 12.3864 25.1076 12.2291L24.6395 14.7866C24.7652 14.8096 24.8856 14.8871 24.9939 15.0028L26.8926 13.2266ZM20.8255 17.508L26.416 15.3257L25.4705 12.9037L19.88 15.086L20.8255 17.508ZM20.5452 17.9264C20.5124 17.861 20.5133 17.807 20.5392 17.7479C20.568 17.6821 20.647 17.5777 20.8254 17.5081L19.8801 15.086C18.3191 15.6952 17.4007 17.4576 18.2216 19.0928L20.5452 17.9264ZM21.1239 18.2083C20.8011 18.2083 20.6036 18.0426 20.5452 17.9262L18.2216 19.093C18.7923 20.2294 19.9868 20.8083 21.1239 20.8083V18.2083ZM21.4202 18.1533C21.3262 18.19 21.2255 18.2083 21.1239 18.2083V20.8083C21.5365 20.8083 21.9589 20.734 22.3654 20.5754L21.4202 18.1533ZM26.9325 16.0014L21.4201 18.1533L22.3655 20.5753L27.878 18.4234L26.9325 16.0014ZM28.7435 17.0292L28.5971 16.6932L26.2135 17.7317L26.3599 18.0678L28.7435 17.0292ZM28.7652 17.0738C28.7567 17.0581 28.7497 17.0435 28.7439 17.0302L26.3595 18.0668C26.3961 18.1511 26.436 18.2326 26.4786 18.3112L28.7652 17.0738ZM28.9019 18.881C29.2368 17.9748 28.8394 17.2104 28.7643 17.0721L26.4795 18.3128C26.4573 18.272 26.4469 18.2452 26.4406 18.2144C26.4334 18.1796 26.4223 18.0902 26.4631 17.9797L28.9019 18.881ZM27.6986 20.1829C27.8837 20.0884 28.5977 19.7038 28.9019 18.8812L26.4632 17.9796C26.4814 17.9302 26.5032 17.8962 26.5174 17.8773C26.5245 17.8678 26.5302 17.8613 26.5337 17.8576C26.5372 17.8539 26.5392 17.8521 26.5392 17.8521C26.5393 17.8521 26.5381 17.853 26.5358 17.8548C26.5335 17.8565 26.5306 17.8585 26.5274 17.8606C26.5206 17.865 26.5159 17.8674 26.5163 17.8672L27.6986 20.1829ZM24.2373 21.4785C25.5484 20.984 26.7687 20.5239 27.5411 20.2506L26.6738 17.7995C25.8698 18.084 24.6185 18.5559 23.3198 19.0457L24.2373 21.4785ZM20.8724 22.7274C21.6163 22.4671 22.9625 21.9593 24.2374 21.4784L23.3198 19.0457C22.0281 19.5329 20.7201 20.0262 20.0138 20.2733L20.8724 22.7274ZM20.3655 23.5456C20.302 23.4043 20.3071 23.266 20.3733 23.1309C20.4428 22.9891 20.5975 22.8236 20.8724 22.7274L20.0138 20.2733C18.2611 20.8865 17.1718 22.7843 17.9945 24.6125L20.3655 23.5456ZM12.7936 27.2198C12.5393 27.2198 12.257 27.2009 11.938 27.156L11.5755 29.7306C12.0058 29.7912 12.4094 29.8198 12.7936 29.8198V27.2198ZM15.4487 26.5272C14.4471 26.9476 13.7724 27.2197 12.7935 27.2198L12.7937 29.8198C14.3488 29.8197 15.4566 29.3437 16.4551 28.9245L15.4487 26.5272ZM15.4577 26.5234L15.4488 26.5271L16.4551 28.9245L16.464 28.9207L15.4577 26.5234ZM15.9234 26.3292C15.7549 26.3986 15.5991 26.464 15.4574 26.5235L16.4643 28.9206C16.6069 28.8608 16.7542 28.7989 16.9127 28.7336L15.9234 26.3292ZM16.3578 25.4999C16.4342 25.6443 16.435 25.7831 16.3807 25.9147C16.3236 26.0531 16.1861 26.2211 15.9234 26.3292L16.9128 28.7336C18.6419 28.0221 19.5933 26.0549 18.6557 24.2835L16.3578 25.4999ZM15.0079 25.1339C15.5965 24.8916 16.184 25.1715 16.3577 25.4997L18.6558 24.2837C17.7775 22.6238 15.684 22.0439 14.0181 22.7297L15.0079 25.1339ZM14.5324 25.332C14.6833 25.2687 14.8395 25.2031 15.0073 25.1342L14.0187 22.7295C13.8408 22.8026 13.6763 22.8716 13.5263 22.9346L14.5324 25.332ZM14.5184 25.3379L14.5324 25.332L13.5263 22.9346L13.5122 22.9405L14.5184 25.3379ZM12.2852 25.8079C12.5172 25.8406 12.8585 25.8976 13.319 25.7861C13.6422 25.7079 14.0335 25.5414 14.5184 25.3379L13.5122 22.9405C13.2414 23.0542 13.0564 23.1311 12.9163 23.1855C12.773 23.2412 12.7201 23.256 12.7074 23.2591C12.7059 23.2594 12.7175 23.2566 12.7381 23.2544C12.7594 23.252 12.778 23.2517 12.7898 23.2521C12.7939 23.2522 12.7839 23.2525 12.6481 23.2333L12.2852 25.8079ZM9.95429 24.3011C10.1118 24.5349 10.8812 25.6103 12.2855 25.8079L12.6477 23.2333C12.5413 23.2183 12.4299 23.1647 12.3151 23.0693C12.1989 22.9726 12.1254 22.8704 12.1103 22.848L9.95429 24.3011ZM9.79827 24.0107L9.86511 24.147L12.1995 23.0021L12.1326 22.8659L9.79827 24.0107ZM11.3457 21.9099L10.5124 22.2198L11.4185 24.6568L12.2519 24.3469L11.3457 21.9099ZM11.6396 21.4921C11.6701 21.556 11.6692 21.6098 11.6412 21.6704C11.6101 21.7378 11.5272 21.8425 11.3458 21.9099L12.2519 24.3469C13.8184 23.7645 14.7748 22.0217 13.9852 20.3704L11.6396 21.4921ZM10.7738 21.256C11.2008 21.0972 11.5612 21.3282 11.6396 21.4921L13.9852 20.3704C13.2472 18.8273 11.3757 18.258 9.8673 18.8192L10.7738 21.256ZM9.90799 21.5779L10.7736 21.2561L9.86751 18.8191L9.00187 19.141L9.90799 21.5779ZM8.28374 20.9272C8.28928 20.9364 8.29505 20.9467 8.30099 20.9581L10.6089 19.7608C10.579 19.7031 10.5467 19.6452 10.5119 19.5873L8.28374 20.9272ZM8.03845 19.025C7.74648 19.9956 8.19526 20.7796 8.28288 20.9258L10.5128 19.5888C10.5248 19.6088 10.5298 19.6194 10.5317 19.6236C10.5335 19.6276 10.535 19.6315 10.5364 19.6372C10.5387 19.6461 10.5507 19.6994 10.5282 19.774L8.03845 19.025ZM9.21739 17.5785C8.99025 17.7099 8.30119 18.1514 8.03842 19.0251L10.5283 19.7739C10.5192 19.8041 10.5075 19.8259 10.4995 19.8384C10.4921 19.8501 10.4878 19.8539 10.4904 19.8512C10.4931 19.8485 10.4985 19.8436 10.5061 19.838C10.5096 19.8354 10.5128 19.8332 10.5154 19.8315C10.5179 19.8299 10.5193 19.8291 10.5192 19.8292L9.21739 17.5785ZM13.7709 15.6921L9.37357 17.5016L10.363 19.906L14.7604 18.0965L13.7709 15.6921ZM14.2053 14.8627C14.2818 15.0072 14.2825 15.1459 14.2282 15.2776C14.1712 15.4159 14.0337 15.584 13.771 15.6921L14.7603 18.0965C16.4895 17.385 17.4409 15.4178 16.5032 13.6464L14.2053 14.8627ZM12.8554 14.4968C13.4441 14.2545 14.0315 14.5343 14.2053 14.8627L16.5033 13.6465C15.6249 11.9867 13.5317 11.4067 11.8657 12.0925L12.8554 14.4968ZM8.35015 16.3506L12.8552 14.4969L11.8659 12.0925L7.36077 13.9462L8.35015 16.3506ZM8.2758 16.3845C8.29989 16.3724 8.32461 16.3611 8.34993 16.3507L7.36098 13.9461C7.27563 13.9812 7.19183 14.0195 7.10974 14.0606L8.2758 16.3845ZM6.1738 18.7554C6.58433 17.3906 7.7418 16.6528 8.27638 16.3842L7.10917 14.0609C6.35889 14.4379 4.40542 15.6081 3.68401 18.0064L6.1738 18.7554ZM6.44755 21.2985C6.18744 20.8055 5.84083 19.8617 6.17375 18.7556L3.68406 18.0063C3.07598 20.0267 3.72393 21.7081 4.14802 22.5118L6.44755 21.2985ZM2.46423 24.3457L5.75085 23.1237L4.84472 20.6867L1.5581 21.9087L2.46423 24.3457ZM2.1704 24.7635C2.13987 24.6996 2.14082 24.6458 2.16878 24.5852C2.19985 24.5179 2.2828 24.4132 2.46422 24.3457L1.55811 21.9087C-0.00845498 22.4912 -0.964877 24.2339 -0.175178 25.8852L2.1704 24.7635ZM2.75106 25.0503C2.42229 25.0503 2.22554 24.8788 2.17043 24.7635L-0.175199 25.8852C0.38249 27.0514 1.59574 27.6503 2.75106 27.6503V25.0503ZM3.03623 24.9996C2.94508 25.0335 2.84841 25.0503 2.75106 25.0503V27.6503C3.14666 27.6503 3.55114 27.5821 3.94257 27.4365L3.03623 24.9996ZM6.36105 23.7633L3.03634 24.9996L3.94246 27.4365L7.26718 26.2003L6.36105 23.7633ZM8.10795 24.6677L7.98131 24.4094L5.64692 25.5543L5.77356 25.8125L8.10795 24.6677ZM8.1299 24.7083C8.12186 24.6947 8.11456 24.6811 8.10791 24.6676L5.77359 25.8126C5.81016 25.8871 5.84959 25.9601 5.8918 26.0315L8.1299 24.7083ZM11.9378 27.156C10.0304 26.8877 8.70952 25.6884 8.12983 24.7082L5.89187 26.0316C6.81251 27.5884 8.77288 29.3364 11.5757 29.7306L11.9378 27.156ZM23.6733 32.4385C24.2926 33.4305 25.3955 33.9188 26.444 33.9188V31.3188C26.1504 31.3188 25.9524 31.1796 25.8788 31.0616L23.6733 32.4385ZM21.5093 28.9723L23.6733 32.4385L25.8788 31.0616L23.7148 27.5954L21.5093 28.9723ZM22.7933 24.8362C21.2664 25.5774 20.5433 27.425 21.5093 28.9723L23.7148 27.5955C23.6692 27.5224 23.6693 27.4662 23.6864 27.414C23.7056 27.3557 23.7662 27.2541 23.9287 27.1752L22.7933 24.8362ZM27.0475 25.9777C26.1524 24.5439 24.2472 24.1301 22.7931 24.8363L23.929 27.1751C24.3152 26.9875 24.7238 27.1653 24.842 27.3546L27.0475 25.9777ZM29.2114 29.4439L27.0475 25.9777L24.842 27.3546L27.006 30.8208L29.2114 29.4439ZM27.9274 33.58C29.4543 32.8388 30.1774 30.9912 29.2115 29.4439L27.0059 30.8207C27.0516 30.8938 27.0515 30.9501 27.0343 31.0022C27.0151 31.0606 26.9546 31.1621 26.792 31.241L27.9274 33.58ZM26.444 33.9188C26.9403 33.9188 27.4505 33.8115 27.9275 33.58L26.792 31.241C26.6873 31.2919 26.568 31.3188 26.444 31.3188V33.9188ZM20.4941 35.0238L20.462 35.0236L20.441 37.6235L20.4732 37.6237L20.4941 35.0238ZM21.0851 34.6499C21.0842 34.6971 21.064 34.7745 20.9649 34.8603C20.8633 34.9483 20.6965 35.0238 20.4837 35.0238V37.6238C22.0725 37.6238 23.6514 36.4696 23.6846 34.6987L21.0851 34.6499ZM21.166 30.3425L21.0851 34.6499L23.6846 34.6987L23.7656 30.3914L21.166 30.3425ZM20.5764 29.9621C20.7931 29.9652 20.9579 30.0451 21.0553 30.1338C21.1501 30.2202 21.1669 30.2958 21.166 30.3425L23.7656 30.3914C23.7993 28.5955 22.2254 27.3859 20.6144 27.3624L20.5764 29.9621ZM19.9618 30.3358C19.9627 30.2893 19.983 30.2105 20.0855 30.123C20.1903 30.0337 20.3611 29.9589 20.5763 29.9621L20.6145 27.3624C19.0087 27.3387 17.3959 28.4965 17.3623 30.287L19.9618 30.3358ZM19.8809 34.6432L19.9618 30.3359L17.3623 30.287L17.2813 34.5944L19.8809 34.6432ZM20.4705 35.0237C20.2538 35.0205 20.089 34.9407 19.9916 34.8519C19.8968 34.7655 19.88 34.6899 19.8809 34.6432L17.2813 34.5944C17.2476 36.3902 18.8215 37.5999 20.4325 37.6234L20.4705 35.0237Z"
                                                                fill="#090909"
                                                                mask="url(#path-1-inside-1_576_3344)"
                                                            />
                                                        </svg>
                                                        Smart Contract Risk
                                                        <div className="circle"></div>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="tab-content" id="myTabContent">
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="home-tab-pane"
                                                    role="tabpanel"
                                                    aria-labelledby="home-tab"
                                                >
                                                    <div className="panel d-flex gap-3 flex-column">
                                                        <div>
                                                            <strong>Custody Risk</strong>
                                                        </div>
                                                        <p>
                                                            The collateral backing DOLA is
                                                            negligible. At the time of writing, the
                                                            collateral on Frontier is mostly $INV
                                                            and $DOLA (overall 87.12% of the total
                                                            TVL). 99.9% of that belongs to Inverse
                                                            itself. Plus Frontier will be deprecated
                                                            anyway.
                                                        </p>
                                                        <p>
                                                            FiRM’s initial liquidity, provided as
                                                            part of an initial guarded launch, is
                                                            $100k in DOLA. It went live with one
                                                            market (i.e. WETH) and the DOLA
                                                            available to borrow might be increased
                                                            during its guarded launch. FiRM is
                                                            designed to reduce systemic risks with
                                                            fully isolated collateral deposits that
                                                            can’t be borrowed. In that regard, it
                                                            resembles the CDP design of MakerDAO,
                                                            with the significant difference that
                                                            borrowers of DOLA need to hold DBRs as
                                                            explained above. However, FiRM does not
                                                            play a role in backing DOLA yet.
                                                        </p>
                                                        <p>
                                                            The current collateral situation appears
                                                            very fragile. DOLA is heavily
                                                            under-collateralized and the new
                                                            product, which is designed to increase
                                                            collateral and demand for DOLA, just
                                                            launched.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="tab-pane fade"
                                                    id="profile-tab-pane"
                                                    role="tabpanel"
                                                    aria-labelledby="profile-tab"
                                                >
                                                    2
                                                </div>
                                                <div
                                                    className="tab-pane fade"
                                                    id="contact-tab-pane"
                                                    role="tabpanel"
                                                    aria-labelledby="contact-tab"
                                                >
                                                    3
                                                </div>
                                                <div
                                                    className="tab-pane fade"
                                                    id="disabled-tab-pane"
                                                    role="tabpanel"
                                                    aria-labelledby="disabled-tab"
                                                >
                                                    4
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
