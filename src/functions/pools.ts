import {BigNumber} from "bignumber.js";

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

const poolsChartdata : { [key: string]: any } = {
    'OUSD': {
        title: 'Convex finance - OUSD pool',
        link: 'https://etherscan.io/address/0x0C597d8e2726AE58db3cA43225CA47fCcC96208B',
        color: '#F64A00',
        value: 0,
    },
    'USDP': {
        title:  'Convex finance - USDP pool',
        link: 'https://etherscan.io/address/0xb6a2641D9a4e8cfa9cE74784222Fd55f8B328179',
        color: '#B8E654',
        value: 0,
    },
} ;

export function poolInfoToChartElement(pool: PoolInfo, percent: BigNumber) : ChartDataElement {
    return {
        ...poolsChartdata[pool.type],
        value: Math.round(new BigNumber(pool.tvlInZunami).dividedBy(percent).toNumber() * 100),
    };
}

export function poolDataToChartData(poolData: Array<PoolInfo>, TVL: BigNumber) {
    return poolData.map(pool => poolInfoToChartElement(pool, TVL)).filter(el => el.value > 0);
}
