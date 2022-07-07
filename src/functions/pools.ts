import { BigNumber } from 'bignumber.js';

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

const poolsChartdata: { [key: string]: any } = {
    DUSD: {
        title: 'Convex finance - DUSD pool',
        color: '#3098F9',
        value: 0,
        icon: '/convex.svg',
    },
    USDN: {
        title: 'Convex finance - USDN pool',
        color: '#FA6005',
        value: 0,
        icon: '/convex.svg',
    },
    LUSD: {
        title: 'Convex finance - LUSD pool',
        color: '#FFC129',
        value: 0,
        icon: '/convex.svg',
    },
    ANCHOR: {
        title: 'Anchor Protocol - UST pool',
        color: '#8DDA2C',
        value: 0,
        icon: '/anchor.svg',
    },
    MIM: {
        title: 'Convex finance - MIM pool',
        color: '#8DDB2C',
        value: 0,
        icon: '/convex.svg',
    },
    PUSD: {
        title: 'Convex finance - PUSD pool',
        color: '#FFC129',
        value: 0,
        icon: '/convex.svg',
    },
    USDD: {
        title: 'Convex finance - USDD pool',
        color: '#2cd5db',
        value: 0,
        icon: '/convex.svg',
    },
};

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber): ChartDataElement {
    return {
        ...poolsChartdata[pool.type],
        tvlInZunami: pool.tvlInZunami,
        value: new BigNumber(pool.tvlInZunami).dividedBy(percent).toNumber() * 100,
        link: `https://etherscan.io/address/${pool.address}`
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    return poolData
        .map((pool) => poolInfoToChartElement(pool, TVL))
        .filter((el) => el.value > 0)
        .sort((a, b) => a.tvlInZunami > b.tvlInZunami ? -1 : 1);
}
