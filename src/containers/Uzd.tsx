import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '../components/Header/Header';
import './Uzd.scss';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { BIG_TEN, BIG_ZERO, NULL_ADDRESS, UZD_DECIMALS } from '../utils/formatbalance';
import BigNumber from 'bignumber.js';
import { contractAddresses } from '../sushi/lib/constants';
import { log } from '../utils/logger';
import { SideBar, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import {
    getZethHistoricalApyUrl,
    getActiveStratsUrl,
    uzdStakingInfoUrl,
    getZethStratsUrl,
    getHistoricalApyUrl,
} from '../api/api';
import useFetch from 'react-fetch-hook';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { ApyChart } from '../components/ApyChart/ApyChart';
import { PoolsStats } from './Main.types';
import { poolDataToChartData } from '../functions/pools';
import { RebaseHistory } from '../components/RebaseHistory/RebaseHistory';
import { Input } from '../components/FastDepositForm/Input/Input';
import { DirectAction } from '../components/Form/DirectAction/DirectAction';
import { StakingSummary } from '../components/StakingSummary/StakingSummary';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { LockHistory } from '../components/LockHistory/LockHistory';
import { SidebarTopButtons } from '../components/SidebarTopButtons/SidebarTopButtons';
import { AddressButtons } from '../components/AddressButtons/AddressButtons';
import useBalanceOf from '../hooks/useBalanceOf';
import { getZunTokenAddress } from '../utils/zunami';
import { renderMobileMenu } from '../components/Header/NavMenu/NavMenu';

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
    } catch (error: any) {
        log(`❗️ Error while adding ${tokenSymbol} token: ${error.message}`);
    }
};

export const Uzd = (): JSX.Element => {
    const { connect, connectors } = useConnect();
    const { address: account, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? parseInt(window.ethereum?.chainId, 16) : 1;

    const zunBalance = useBalanceOf(getZunTokenAddress(chainId));

    const zethBalance = BIG_ZERO;
    const uzdTotalSupply = BIG_ZERO;
    const zethTotalSupply = BIG_ZERO;
    const lpPrice = BIG_ZERO;
    const [supportedChain, setSupportedChain] = useState(true);
    const [hideMigrationModal, setHideMigrationModal] = useState(false);
    const apsBalance = BIG_ZERO;
    const uzdBalance = BIG_ZERO;
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
                      ? uzdStatData.info.zunUSDAps.tvl
                      : uzdStatData.info.zunETH.tvl
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
                ? uzdStatData.info.zunUSDAps.monthlyAvgApy
                : uzdStatData.info.zunETH.monthlyAvgApy;

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
                    ? uzdStatData.info.zunETH.monthlyAvgApy
                    : uzdStatData.info.zunUSDAps.monthlyAvgApy;

            apy90 =
                stakingMode === 'ZETH'
                    ? uzdStatData.info.zunETH.threeMonthAvgApy
                    : uzdStatData.info.zunUSDAps.threeMonthAvgApy;
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
        if (!uzdStatLoading && uzdStatData.totalTvlUsd) {
            setTvl(uzdStatData.totalTvlUsd);
        }
    }, [uzdStatLoading, uzdStatData?.totalTvlUsd]);

    const baseApy = useMemo(() => {
        let result = '0';

        if (!uzdStatData) {
            return result;
        }

        if (stakingMode === 'UZD') {
            result = uzdStatData.info.zunUSDAps.apy;
        }

        if (stakingMode === 'ZETH') {
            result = uzdStatData.info.zunETH.apy;
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
                                        <AddressButtons
                                            address={NULL_ADDRESS}
                                            inverseColors={true}
                                        />
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
                        <div className="row ms-0 ms-lg-4">
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
                                                <div className="gray-block small-block align-items-start stablecoin ps-3 me-0 me-md-2">
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
                                                    <div className="d-flex flex-row justify-content-between gray-block small-block align-items-center stablecoin ps-3">
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
                                                <div className="h-100 gray-block small-block align-items-start stablecoin ps-3 me-0 me-md-2">
                                                    <div>
                                                        <span className="name">
                                                            Current vote weight
                                                        </span>
                                                    </div>
                                                    <div className="vela-sans value mt-1">75</div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-9 mt-3 mt-md-0">
                                                <div className="gray-block small-block align-items-start stablecoin ps-3">
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
                                <div className="card mt-3 h-100 mb-3 mb-lg-0">
                                    <div className="card-body pb-3 pb-lg-0">
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
                        {/* <SupportersBar section="uzd" className="row" /> */}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
