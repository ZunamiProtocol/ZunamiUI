import BigNumber from 'bignumber.js';
import { PoolInfo } from '../functions/pools';

export interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
    apr: number;
    monthlyAvgApy: number;
}

export interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

export interface PoolsStats {
    pools: Array<PoolInfo>;
    strategies: any;
}

export interface Balance {
    chainId: String;
    value: BigNumber;
    key: string;
}
