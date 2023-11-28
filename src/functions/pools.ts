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
    analytics: Object;
    icon: string;
    tvl: string;
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
    XAI_FRAXBP: {
        title: 'Convex Frax Booster - XAI/FRAXBP',
        value: 0,
        icon: '/convex.svg',
    },
    ALUSD_FRAXBP: {
        title: 'Convex Frax Booster - ALUSD/FRAXBP pool',
        value: 0,
        icon: '/convex.svg',
    },
    PUSD: {
        title: 'Convex finance - PUSD pool',
        value: 0,
        icon: '/convex.svg',
    },
    STAKE_DAO_MIM: {
        title: 'Stake DAO - MIM pool',
        value: 0,
        icon: '/stake-dao.svg',
    },
    STAKE_DAO_MIM_V2: {
        title: 'Stake DAO - MIM pool',
        value: 0,
        icon: '/stake-dao.svg',
    },
    CLEVUSD_FRAXBP: {
        title: 'Convex Frax Booster - clevUSD/FRAXBP',
        value: 0,
        icon: '/convex.svg',
    },
    EUSD_FRAXBP: {
        title: 'Convex Frax Booster - eUSD/FRAXBP',
        value: 0,
        icon: '/eusd.svg',
    },
    // UZD strats
    VAULT: {
        title: 'UZD Vault',
        value: 0,
        icon: '/uzd.svg',
    },
    ZETH_VAULT: {
        title: 'Vault',
        value: 0,
        icon: '/zeth_vault.svg',
    },
    FRAXETH: {
        title: 'Convex Finance - zETH/frxETH',
        value: 0,
        icon: '/frx_eth.svg',
    },
    STETH_FRAXETH: {
        title: 'Convex Finance - stETH/frxETH pool',
        value: 0,
        icon: '/frx_eth.svg',
    },
    CONCENTRATOR_FRAX: {
        title: 'Concentrator UZD/FRAXBP pool',
        value: 0,
        icon: '/uzd.svg',
    },
    FRAX_STAKEDAO: {
        title: 'Stake DAO - UZD / FRAXBP pool',
        value: 0,
        icon: '/uzd.svg',
    },
    STAKEDAO_CRVUSD_USDT: {
        title: 'Stake DAO - crvUSD / USDT pool',
        value: 0,
        icon: '/stake-dao.svg',
    },
    CONVEX_FRAX: {
        title: 'Convex Finance - UZD/FRAXBP pool',
        value: 0,
        icon: '/uzd.svg',
    },
    ALETH_FRAXETH: {
        title: 'Convex Finance - alETHfrxETH pool',
        value: 0,
        icon: '/convex.svg',
    },
    SETH_FRAXETH: {
        title: 'Convex Finance - sETH/frxETH pool',
        value: 0,
        icon: '/convex.svg',
    },
    CONVEX_FRAX_STAKING: {
        title: 'Convex Frax Booster - UZD/FRAXBP',
        value: 0,
        icon: '/uzd.svg',
    },
};

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber): ChartDataElement {
    const strategyTvl = pool.tvlInZunami ? pool.tvlInZunami : pool.tvl;
    const percentFromTVL = new BigNumber(strategyTvl).dividedBy(percent).toNumber() * 100;
    const tvlInUsd = Number(
        (getBalanceNumber(new BigNumber(percent)).toNumber() / 100) * percentFromTVL
    ).toFixed(0);

    return {
        ...poolsChartdata[pool.type],
        tvlInZunami: strategyTvl,
        value: percentFromTVL,
        tvlInUsd,
        link: `https://etherscan.io/address/${pool.address}`,
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    return poolData
        .map((pool, index) => {
            const result = {
                ...poolInfoToChartElement(pool, TVL),
                // type: pool.type,
                // address: pool.address,
                color: colors[index],
                ...pool,
                // @ts-ignore
                analytics: pool.analytics?.data,
            };

            return result;
        })
        .filter((el) => el.value > 0)
        .sort((a, b) => (a.tvlInZunami > b.tvlInZunami ? -1 : 1));
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
