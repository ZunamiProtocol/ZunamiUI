const root = "https://zunami-reward-api.herokuapp.com/api"
export const poolStatsUrl = `${root}/pool/stats`
export const zunamiInfoUrl = `${root}/zunami/info`

export const getPoolStatsUrl = (poolTypes: string): string => {
    return poolStatsUrl + "?types=" + poolTypes;
}
