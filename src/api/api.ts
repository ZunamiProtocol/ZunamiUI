const root = "https://zunami-reward-api.herokuapp.com/api";
export const poolStatsUrl = `${root}/pool/stats`;
export const zunamiInfoUrl = `${root}/zunami/info`;
export const historicalApyUrl = `${root}/zunami/apy-chart`;

export const getPoolStatsUrl = (poolTypes: string): string => {
    return poolStatsUrl + "?types=" + poolTypes;
};

export const getHistoricalApyUrl = (period : string): string => {
    return `${historicalApyUrl}?period=${period.toUpperCase()}`;
};
