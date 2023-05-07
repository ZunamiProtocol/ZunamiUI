import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../utils/formatbalance';

export interface PoolInfo {
    pid: number;
    apr: number;
    apy: number;
    tvlInZunami: number;
    type: string;
    address: string;
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
        title: 'Convex Finance - XAI/FRAXBP Pool',
        value: 0,
        icon: '/convex.svg',
    },
    ALUSD_FRAXBP: {
        title: 'Convex Finance - ALUSD/FRAXBP Pool',
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
        title: 'Convex Finance - clevUSDFRAXBP Pool',
        value: 0,
        icon: '/convex.svg',
    },
};

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber): ChartDataElement {
    const percentFromTVL = new BigNumber(pool.tvlInZunami).dividedBy(percent).toNumber() * 100;
    const tvlInUsd = Number(
        (getBalanceNumber(new BigNumber(percent)).toNumber() / 100) * percentFromTVL
    ).toFixed(0);

    return {
        ...poolsChartdata[pool.type],
        tvlInZunami: pool.tvlInZunami,
        value: percentFromTVL,
        tvlInUsd,
        link: `https://etherscan.io/address/${pool.address}`,
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    return poolData
        .map((pool, index) => {
            return {
                ...poolInfoToChartElement(pool, TVL),
                // type: pool.type,
                // address: pool.address,
                color: colors[index],
                ...pool,
                analytics: pool.analytics?.data,
            };
        })
        .filter((el) => el.value > 0)
        .sort((a, b) => (a.tvlInZunami > b.tvlInZunami ? -1 : 1));
}
