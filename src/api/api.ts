import { log } from '../utils/logger';

const root = 'https://zunami-reward-api.herokuapp.com/api';
export const poolStatsUrl = `${root}/pool/stats`;
export const activeStratsUrl = `${root}/pool/active-pools-stats`;
export const uzdStratsUrl = `${root}/aps/strategy/active-strategies-stats`;
export const zunamiInfoUrl = `${root}/zunami/info`;
export const uzdStakingInfoUrl = `${root}/v2/zunami/info`;

export const historicalApyUrl = `${root}/zunami/apy-chart`;
export const apsHistoricalApyUrl = `${root}/zunami/aps-apy-chart`;
export const testnetUrl = `${root}/feature`;
export const totalIncomeUrl = `${root}/transfers/total-income`;
export const apsTotalIncomeUrl = `${root}/v2/transfers/total-income`;
export const transHistoryUrl = `${root}/transfers/history`;
export const uzdTransHistoryUrl = `${root}/uzd/transfers/history`;
export const uzdRebaseHistoryUrl = `${root}/uzd/rebase/history`;

export const curvePoolsApyUrl = 'https://api.curve.fi/api/getFactoryAPYs?version=2';

const BSC_NETWORK_ID = 56;
const POLYGON_NETWORK_ID = 137;

export const getActiveStratsUrl = (): string => {
    return activeStratsUrl;
};

export const getUzdStratsUrl = (): string => {
    return uzdStratsUrl;
};

export const getPoolStatsUrl = (poolTypes: string): string => {
    return poolStatsUrl + '?types=' + poolTypes;
};

export const getHistoricalApyUrl = (period: string): string => {
    return `${historicalApyUrl}?period=${period.toUpperCase()}`;
};

export const getApsHistoricalApyUrl = (period: string): string => {
    return `${apsHistoricalApyUrl}?period=${period.toUpperCase()}`;
};

export const getTestnetStatusUrl = (address: string): string => {
    return `${testnetUrl}?address=${address}`;
};

export const getApsTotalIncomeUrl = (
    address: string,
    lpTokens: string,
    apsLpTokens: string
): string => {
    return `${apsTotalIncomeUrl}?address=${address.toLowerCase()}&lpTokens=${lpTokens}&apsLpTokens=${apsLpTokens}`;
};

export const getTotalIncomeUrl = (
    address: string,
    lpTokens: string,
    chainId: number = 1
): string => {
    let chain = 'ETH';

    switch (chainId) {
        case BSC_NETWORK_ID:
            chain = 'BSC';
            break;
        case POLYGON_NETWORK_ID:
            chain = 'MATIC';
            break;
    }

    return `${totalIncomeUrl}?address=${address.toLowerCase()}&lpTokens=${lpTokens}&chain=${chain}`;
};

export const getRebaseHistoryUrl = (page: number = 0, size: number = 20): string => {
    return `${uzdRebaseHistoryUrl}?page=${page}&size=${size}`;
};

export const getTransHistoryUrl = (
    address: string,
    type: string,
    page: number = 0,
    size: number = 50,
    chainId: number = 1,
    historyType: string
): string => {
    let chain = 'ETH';

    switch (chainId) {
        case BSC_NETWORK_ID:
            chain = 'BSC';
            break;
        case POLYGON_NETWORK_ID:
            chain = 'MATIC';
            break;
    }

    const endpointUrl =
        historyType === 'DEPOSIT_WITHDRAW'
            ? `${transHistoryUrl}?address=${address.toLowerCase()}&type=${type}&page=${page}&size=${size}&chain=${chain}`
            : `${uzdTransHistoryUrl}?address=${address.toLowerCase()}&type=${type}&page=${page}&size=${size}`;

    return endpointUrl;
};

export const getBackendSlippage = async (lpAmount: string, tokenIndex: number) => {
    log(
        `Requesting backend slippage (${`${root}/zunami/slippage?tokenIndex=${tokenIndex}&lpAmount=${lpAmount}`})`
    );
    return fetch(`${root}/zunami/slippage?tokenIndex=${tokenIndex}&lpAmount=${lpAmount}`)
        .then((response) => {
            if (response.status !== 200) {
                throw new Error(`Server response: ${response.statusText}, code ${response.status}`);
            }

            return response.json();
        })
        .then((data) => data.slippage)
        .catch((error) => {
            log(`❗️ Error while retrieving slippage: ${error.message}`);
            return '0';
        });
};
