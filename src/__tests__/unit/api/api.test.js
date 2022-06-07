import {
    getPoolStatsUrl,
    getHistoricalApyUrl,
    getTestnetStatusUrl,
    getTotalIncomeUrl,
} from '../../../api/api';

describe('API', () => {
    it('Check pool stat correct URL', () => {
        expect(getPoolStatsUrl('USDN')).toBe(
            'https://zunami-reward-api.herokuapp.com/api/pool/stats?types=USDN'
        );
    });

    it('Check history APY URL', () => {
        expect(getHistoricalApyUrl('week')).toBe(
            'https://zunami-reward-api.herokuapp.com/api/zunami/apy-chart?period=WEEK'
        );
    });

    it('Check testnet participation URL', () => {
        expect(getTestnetStatusUrl('0x000')).toBe(
            'https://zunami-reward-api.herokuapp.com/api/feature?address=0x000'
        );
    });

    it('Check total income URL', () => {
        expect(getTotalIncomeUrl('0x000', '1000')).toBe(
            'https://zunami-reward-api.herokuapp.com/api/transfers/total-income?address=0x000&lpTokens=1000'
        );
    });
});
