import React, { useEffect, useState, Suspense, lazy } from 'react';
import { InfoBlock } from '../components/InfoBlock/InfoBlock';
import { ClickableHeader } from '../components/ClickableHeader/ClickableHeader';
import './Main.scss';
import { getBalanceNumber } from '../utils/formatbalance';
import useLpPrice from '../hooks/useLpPrice';
import useUserLpAmount from '../hooks/useUserLpAmount';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import useFetch from 'react-fetch-hook';
import { zunamiInfoUrl, getHistoricalApyUrl, getTotalIncomeUrl, getActiveStratsUrl } from '../api/api';
import { BigNumber } from 'bignumber.js';
import usePendingOperations from '../hooks/usePendingOperations';
import { PoolInfo, poolDataToChartData } from '../functions/pools';
import { Preloader } from '../components/Preloader/Preloader';
import { BalanceInfoBlock } from '../components/BalanceInfoBlock/BalanceInfoBlock';

const Header = lazy(
    () => import('../components/Header/Header').then(module => ({ default: module.Header }))
  );

const MobileSidebar = lazy(
    () => import('../components/SideBar/MobileSidebar/MobileSidebar').then(module => ({ default: module.MobileSidebar }))
  );

const PendingBalance = lazy(
    () => import('../components/PendingBalance/PendingBalance').then(module => ({ default: module.PendingBalance }))
  );

const SideBar = lazy(
    () => import('../components/SideBar/SideBar').then(module => ({ default: module.SideBar }))
  );

const WalletStatus = lazy(
    () => import('../components/WalletStatus/WalletStatus').then(module => ({ default: module.WalletStatus }))
  );

const ApyChart = lazy(
    () => import('../components/ApyChart/ApyChart').then(module => ({ default: module.ApyChart }))
  );

  const Chart = lazy(
    () => import('../components/Chart/Chart').then(module => ({ default: module.Chart }))
  );

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
    apr: number;
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
    const lpPrice = useLpPrice();
    const userLpAmount = useUserLpAmount();
    const userMaxWithdraw =
        lpPrice.toNumber() > 0 && userLpAmount.toNumber() !== -1
            ? lpPrice.multipliedBy(userLpAmount)
            : new BigNumber(-1);

    const { account, connect, ethereum } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);

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
        if (!account || userLpAmount.toNumber() === -1) {
            return;
        }

        const getTotalIncome = async () => {
            const response = await fetch(
                getTotalIncomeUrl(account, userLpAmount.toNumber().toString())
            );

            const data = await response.json();
            setTotalIncome(`$${data.totalIncome}`);
        };

        getTotalIncome();
    }, [account, userLpAmount]);

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
                val={`PD: $${getBalanceNumber(pendingOperations.deposit, 6)}`}
                hint={`You have $${pendingOperations.deposit} in pending deposit`}
            />
            <PendingBalance
                val={`PW: $${getBalanceNumber(pendingWithdraw).toFixed(2)}`}
                hint={`You have $${pendingWithdraw} in pending withdraw`}
            />
        </div>
    );

    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
        <React.Fragment>
            <Header />
            <MobileSidebar />
            <div className="container">
                <div className="row main-row h-100">
                    <SideBar isMainPage={true} />

                    <div className="col content-col dashboard-col">
                        <WalletStatus />
                        <ClickableHeader name="Dashboard" icon="dashboard" />
                        <div className={'first-row'}>
                            <BalanceInfoBlock
                                title="Balance"
                                description={
                                    <div>
                                        {account && userMaxWithdraw.toNumber() === -1 && (
                                            <Preloader onlyIcon={true} />
                                        )}
                                        {!account && 'n/a'}
                                        {account &&
                                            userMaxWithdraw.toNumber() !== -1 &&
                                            `$ ${getBalanceNumber(userMaxWithdraw)
                                                .toNumber()
                                                .toLocaleString('en')}`}
                                    </div>
                                }
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                            />
                            <InfoBlock
                                title="Pending Deposits / Withdraws"
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                                secondaryRow={pdElement}
                                hint={
                                    <span>
                                        Funds passing through the Transaction Streamlining Mechanism
                                        and will be credited within 24 hours
                                    </span>
                                }
                            />
                            <InfoBlock
                                title="Total Income"
                                description={
                                    <div>
                                        {account && totalIncome === 'n/a' && (
                                            <Preloader onlyIcon={true} />
                                        )}
                                        {!account && 'n/a'}
                                        {account && totalIncome !== 'n/a' && totalIncome}
                                    </div>
                                }
                                isLoading={isZunLoading}
                                withColor={true}
                                isStrategy={false}
                                colorfulBg={true}
                            />
                        </div>
                        <div className="second-row">
                            <InfoBlock
                                title="Profit"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            dailyProfit ? dailyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Daily&nbsp;&nbsp;</span>
                                    </div>
                                }
                                withColor={false}
                                isStrategy={false}
                            />
                            <InfoBlock
                                title="&nbsp;"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            monthlyProfit ? monthlyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Monthly</span>
                                    </div>
                                }
                                withColor={false}
                                isStrategy={false}
                            />
                            <InfoBlock
                                title="&nbsp;"
                                description={
                                    <div>
                                        <span className="text-primary">{`${
                                            yearlyProfit ? yearlyProfit.toFixed(2) : 0
                                        } USD`}</span>
                                        <span> Yearly</span>
                                    </div>
                                }
                                withColor={false}
                                isStrategy={false}
                            />
                        </div>
                        <div className="third-row">
                            <div className="strats-chart-col">
                                <Chart data={chartData} />
                            </div>
                            <div className="hist-apy-col">
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
                <footer className="">
                    <div className="mobile">
                        <a href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing">
                            How to use?
                        </a>
                        <a href="https://www.zunami.io/#faq-main" target="_blank" rel="noreferrer">
                            FAQ
                        </a>
                    </div>
                    <span className="copyright">© 2022 Zunami Protocol. Beta version 1.1</span>
                    <ul className="list-inline mb-0">
                        <li className="list-inline-item">
                            <a
                                href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing"
                                target="blank"
                            >
                                How to use?
                            </a>
                        </li>
                        <li className="list-inline-item">
                            <a href="https://www.zunami.io/#faq-main" target="blank">
                                FAQ
                            </a>
                        </li>
                        <li className="list-inline-item">
                            <a href="https://zunami.io" target="blank">
                                Website
                            </a>
                        </li>
                    </ul>
                </footer>
            </div>
        </React.Fragment>
        </Suspense>
    );
};
