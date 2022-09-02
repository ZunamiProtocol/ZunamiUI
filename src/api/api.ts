const root = 'https://zunami-reward-api.herokuapp.com/api';
export const poolStatsUrl = `${root}/pool/stats`;
export const activeStratsUrl = `${root}/pool/active-pools-stats`;
export const zunamiInfoUrl = `${root}/zunami/info`;

export const historicalApyUrl = `${root}/zunami/apy-chart`;
export const testnetUrl = `${root}/feature`;
export const totalIncomeUrl = `${root}/transfers/total-income`;
export const transHistoryUrl = `${root}/transfers/history`;

export const getActiveStratsUrl = (): string => {
    return activeStratsUrl;
};

export const getPoolStatsUrl = (poolTypes: string): string => {
    return poolStatsUrl + '?types=' + poolTypes;
};

export const getHistoricalApyUrl = (period: string): string => {
    return `${historicalApyUrl}?period=${period.toUpperCase()}`;
};

export const getTestnetStatusUrl = (address: string): string => {
    return `${testnetUrl}?address=${address}`;
};

export const getTotalIncomeUrl = (
    address: string,
    lpTokens: string,
    chainId: number = 1
): string => {
    const chain = chainId === 1 ? 'ETH' : 'BSC';
    return `${totalIncomeUrl}?address=${address.toLowerCase()}&lpTokens=${lpTokens}&chain=${chain}`;
};

export const getTransHistoryUrl = (
    address: string,
    type: string,
    page: number = 0,
    size: number = 10,
    chainId: number = 1
): string => {
    const chain = chainId === 1 ? 'ETH' : 'BSC';
    return `${transHistoryUrl}?address=${address.toLowerCase()}&type=${type}&page=${page}&size=${size}&chain=${chain}`;
};
