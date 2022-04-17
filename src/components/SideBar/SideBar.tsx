import { Col } from 'react-bootstrap';
import './SideBar.scss';
import { getBalanceNumber } from '../../utils/formatbalance';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { getPoolStatsUrl, zunamiInfoUrl, getHistoricalApyUrl } from '../../api/api';
import useFetch from 'react-fetch-hook';
import { BigNumber } from 'bignumber.js';

interface ZunamiInfo {
    tvl: BigNumber;
    apy: number;
}

interface ZunamiInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

interface SideBarProps {
    isMainPage: boolean;
}

export const SideBar = (props: SideBarProps): JSX.Element => {
    const {
        isLoading: isZunLoading,
        data: zunData,
        error: zunError,
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    return (
        <Col className={'SidebarColumn'}>
            <div className="Sidebar">
                <div className="Sidebar__Title">Yield Aggregator for Best Stablecoin Staking</div>
                <div className="Sidebar__Description">
                    Zunami is the DAO that works with stablecoins and solves the main issues of
                    current yield-farming protocols by streamlining interaction with DeFi, making it
                    easier and cheaper while increasing profitability by differentiating and
                    rebalancing users’ funds.
                </div>
                <div className="d-flex">
                    <InfoBlock
                        title="Total Value Locked"
                        description={`${
                            zunamiInfo && !zunError
                                ? `$${Number(getBalanceNumber(zunamiInfo.tvl)).toLocaleString(
                                      'en',
                                      {
                                          maximumFractionDigits: 0,
                                      }
                                  )}`
                                : 'n/a'
                        }`}
                        isLoading={isZunLoading}
                        withColor={true}
                        isStrategy={false}
                        colorfulBg={true}
                    />
                    <InfoBlock
                        title="Base APY"
                        description={`${
                            zunamiInfo && !zunError ? `${zunamiInfo.apy.toFixed(0)}%` : 'n/a'
                        }`}
                        isLoading={isZunLoading}
                        withColor={true}
                        isStrategy={false}
                        colorfulBg={true}
                        hint="Annual Percentage Yield. Сumulative yield from all strategies used &amp; includes 0% management fee"
                    />
                    <InfoBlock
                        title="Reward APY"
                        description="Soon"
                        withColor={true}
                        isStrategy={false}
                        colorfulBg={true}
                        hint="Annual Percentage Yield. Сumulative yield from all strategies used &amp; includes 0% management fee"
                    />
                </div>
                <div className="FastDeposit border rounded">
                    <div className="d-flex justify-content-between">
                        <span>Fast deposit</span>
                        <span>Tap to Deposit & Withdraw Page</span>
                    </div>
                </div>
            </div>
        </Col>
    );
};
