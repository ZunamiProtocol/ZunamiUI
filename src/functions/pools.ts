import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../utils/formatbalance';

export interface PoolInfo {
    pid: number;
    apr: number;
    apy: number;
    tvlInZunami: number;
    type: string;
    address: string;
    title?: string;
    icon: string;
    tvl: string;
    tvlUsd: number;
    primaryIcon: string;
    secondaryIcon: string;
}

export interface ChartDataElement {
    title: string;
    link: string;
    color: string;
    value: number;
    tvlInZunami: number;
    address: string;
}

const colors = ['#FC6505', '#12A0FE', '#8EEA19', '#2cd5db', '#1C77F2', '#323232', '#5856d6'];

export const poolsChartdata: { [key: string]: any } = {
    USDT_CRVUSD: {
        title: 'StakeDAO - crvUSD/USDC',
        value: 0,
        icon: '/stake-dao.svg',
        primaryIcon: 'curve-icon.svg',
        secondaryIcon: 'usdt.svg',
    },
    USDC_CRVUSD: {
        title: 'StakeDAO - crvUSD/USDT',
        value: 0,
        icon: '/stake-dao.svg',
        primaryIcon: 'curve-icon.svg',
        secondaryIcon: 'usdc.svg',
    },
    // UZD strats
    ZUN_USD_VAULT: {
        title: 'zunUSD Vault',
        value: 0,
        icon: '/uzd.svg',
    },
};

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber): ChartDataElement {
    const strategyTvl = pool.tvlInZunami ? pool.tvlInZunami : pool.tvl;
    let percentFromTVL = new BigNumber(strategyTvl).dividedBy(percent).toNumber() * 100;

    if (percentFromTVL === Infinity) {
        percentFromTVL = 100;
    }
    return {
        ...poolsChartdata[pool.type],
        tvlInZunami: strategyTvl,
        value: percentFromTVL,
        tvlInUsd: pool.tvlUsd,
        link: `https://etherscan.io/address/${pool.address}`,
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    const result = poolData
        .map((pool, index) => {
            const result = {
                ...poolInfoToChartElement(pool, TVL),
                color: colors[index],
                ...pool,
                // @ts-ignore
            };

            if (!result.address && result.type === '') {
                result.address = '0x0Bcf22e3d86595FFaFbA49947280C0b802843550';
            }

            return result;
        })
        .filter((el) => el.value > 0)
        .sort((a, b) => (a.tvlInZunami > b.tvlInZunami ? -1 : 1));

    console.log(result);

    return result;
}

export function formatPoolApy(rawValue: number) {
    let result = rawValue.toFixed(2);

    if (rawValue > 500) {
        result = '500+';
    }

    return result;
}

export function getPoolPrimaryIcon(pool: any) {
    let result = '/clever_analytics.png';
    const analytics = pool.analytics.data ? pool.analytics.data : pool.analytics;

    if (analytics && analytics.coinsMarketData.stableCoin) {
        result = analytics.coinsMarketData.stableCoin.image;
    }

    if (pool.type === 'STAKEDAO_CRVUSD_USDT') {
        result = '/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e.png';
    }

    return result;
}
