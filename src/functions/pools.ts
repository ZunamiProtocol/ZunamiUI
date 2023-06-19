import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../utils/formatbalance';
import { debug } from 'console';

export interface PoolInfo {
    pid: number;
    apr: number;
    apy: number;
    tvlInZunami: number;
    type: string;
    address: string;
    title?: string;
    analytics: Object;
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
    DUSD: {
        title: 'Convex finance - DUSD pool',
        value: 0,
        icon: '/convex.svg',
    },
    USDN: {
        title: 'Convex finance - USDN pool',
        value: 0,
        icon: '/convex.svg',
    },
    LUSD: {
        title: 'Convex finance - LUSD pool',
        value: 0,
        icon: '/convex.svg',
    },
    ANCHOR: {
        title: 'Anchor Protocol - UST pool',
        value: 0,
        icon: '/anchor.svg',
    },
    MIM: {
        title: 'Convex finance - MIM pool',
        value: 0,
        icon: '/convex.svg',
    },
    XAI_FRAXBP: {
        title: 'Convex Finance - XAI/FRAXBP pool',
        value: 0,
        icon: '/convex.svg',
    },
    ALUSD_FRAXBP: {
        title: 'Convex Finance - ALUSD/FRAXBP pool',
        value: 0,
        icon: '/convex.svg',
    },
    PUSD: {
        title: 'Convex finance - PUSD pool',
        value: 0,
        icon: '/convex.svg',
    },
    USDD: {
        title: 'Convex finance - USDD pool',
        value: 0,
        icon: '/convex.svg',
    },
    DOLA: {
        title: 'Convex finance - DOLA pool',
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
        title: 'Convex Finance - clevUSD/FRAXBP pool',
        value: 0,
        icon: '/convex.svg',
    },
    EUSD_FRAXBP: {
        title: 'Convex Finance - eUSD/FRAXBP',
        value: 0,
        icon: '/eusd.svg',
    },
    // UZD strats
    VAULT: {
        title: 'UZD Vault',
        value: 0,
        icon: '/uzd.svg',
    },
    FRAX_STAKEDAO: {
        title: 'Stake DAO - UZD / FRAXBP pool',
        value: 0,
        icon: '/uzd.svg',
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
                analytics: pool.analytics?.data,
            };

            return result;
        })
        .filter((el) => el.value > 0)
        .sort((a, b) => (a.tvlInZunami > b.tvlInZunami ? -1 : 1));
}
