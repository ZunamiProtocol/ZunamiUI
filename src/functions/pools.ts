import { BigNumber } from 'bignumber.js';

export interface PoolInfo {
    pid: number;
    apr: number;
    apy: number;
    tvlInZunami: string;
    type: string;
}

export interface ChartDataElement {
    title: string;
    link: string;
    color: string;
    value: number;
}

const poolsChartdata: { [key: string]: any } = {
    OUSD: {
        title: 'Convex finance - OUSD pool',
        link: 'https://etherscan.io/address/0x0C597d8e2726AE58db3cA43225CA47fCcC96208B',
        color: '#F64A00',
        value: 0,
    },
    USDP: {
        title: 'Convex finance - USDP pool',
        link: 'https://etherscan.io/address/0xb6a2641D9a4e8cfa9cE74784222Fd55f8B328179',
        color: '#B8E654',
        value: 0,
    },
    DUSD: {
        title: 'Convex finance - DUSD pool',
        link: 'https://etherscan.io/address/0x63f920108834672619a8720321422dce79724766',
        color: '#3098F9',
        value: 0,
    },
    USDN: {
        title: 'Convex finance - USDN pool',
        link: 'https://etherscan.io/address/0xc2bbEDcCE9b54a9F8eaAFf40D1965f9b25B74e66',
        color: '#8DDA2C',
        value: 0,
    },
    LUSD: {
        title: 'Convex finance - LUSD pool',
        link: 'https://etherscan.io/address/0x9903ABbd0006350115D15e721f2d7e3eb6f13b97',
        color: '#B8E654',
        value: 0,
    },
};

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber): ChartDataElement {
    return {
        ...poolsChartdata[pool.type],
        value: Math.round(new BigNumber(pool.tvlInZunami).dividedBy(percent).toNumber() * 100),
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    return poolData.map((pool) => poolInfoToChartElement(pool, TVL)).filter((el) => el.value > 0);
}
