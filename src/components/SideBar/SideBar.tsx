import { Col } from 'react-bootstrap';
import './SideBar.scss';
import { getBalanceNumber } from '../../utils/formatbalance';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { zunamiInfoUrl } from '../../api/api';
import useFetch from 'react-fetch-hook';
import { BigNumber } from 'bignumber.js';
import { FastDepositForm } from '../FastDepositForm/FastDepositForm';

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
                        icon={
                            <svg
                                width="35"
                                height="37"
                                viewBox="0 0 35 37"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="InfoBlock__Icon"
                            >
                                <path
                                    d="M2.98 28.4718C2.452 32.833 1.44 35.3078 1 36H34V4.58952C33.56 5.10871 32.614 6.19899 32.35 6.40666C32.02 6.66625 28.06 6.66625 27.07 6.40666C26.08 6.14707 25.9523 2.31162 25.42 1.47443C25.09 0.955383 24.0163 0.85213 23.44 1.21483C21.79 2.25335 22.78 6.92598 22.12 7.70462C21.6021 8.31559 20.47 8.4833 19.15 8.22371C17.83 7.96412 16.51 8.74312 15.85 9.52167C15.1899 10.3004 14.53 15.2329 13.54 16.5306C13.0596 17.1603 12.22 16.7902 11.23 17.0498C10.24 17.3094 10.57 18.6076 9.58 19.1268C8.59 19.646 5.29 18.348 4.3 19.3861C3.70592 20.0091 3.64 23.0204 2.98 28.4718Z"
                                    fill="url(#paint0_linear_5_2719)"
                                    fillOpacity="0.16"
                                />
                                <path
                                    d="M1 36C1.44 35.3078 2.452 32.833 2.98 28.4718C3.64 23.0204 3.70592 20.0091 4.3 19.3861C5.29 18.348 8.59 19.646 9.58 19.1268C10.57 18.6076 10.24 17.3094 11.23 17.0498C12.22 16.7902 13.0596 17.1603 13.54 16.5306C14.53 15.2329 15.1899 10.3004 15.85 9.52167C16.51 8.74312 17.83 7.96412 19.15 8.22371C20.47 8.4833 21.6021 8.31559 22.12 7.70462C22.78 6.92598 21.79 2.25335 23.44 1.21483C24.0163 0.85213 25.09 0.955383 25.42 1.47443C25.9523 2.31162 26.08 6.14707 27.07 6.40666C28.06 6.66625 32.02 6.66625 32.35 6.40666C32.614 6.19899 33.56 5.10871 34 4.58952"
                                    stroke="#F64A00"
                                    strokeWidth="1.3"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_5_2719"
                                        x1="17.5"
                                        y1="1"
                                        x2="17.5"
                                        y2="36"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#F9A312" />
                                        <stop offset="1" stopColor="#F84C01" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        }
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
                        hint="TEXT"
                    />
                </div>
                <FastDepositForm />
                <footer>
                    <div className="mobile">
                        <a href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing">
                            How to use?
                        </a>
                        <a href="https://www.zunami.io/#faq-main" target="_blank" rel="noreferrer">
                            FAQ
                        </a>
                    </div>
                    <span className="copyright">© 2022 Zunami Protocol. Beta version 1.1</span>
                </footer>
            </div>
        </Col>
    );
};
