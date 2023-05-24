import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { getBalanceNumber } from '../../utils/formatbalance';
import './YourData.scss';
import { networks } from '../NetworkSelector/NetworkSelector';

interface Balance {
    chainId: string;
    value: BigNumber;
    key: string;
}

interface YourDataProps {
    account: string | null;
    lpPrice: BigNumber;
    balances: Array<Balance>;
    userMaxWithdraw: string;
    totalIncome: string;
    dailyProfit: number;
    monthlyProfit: number;
    yearlyProfit: number;
}

function getNetworkByKey(key: string) {
    return networks.filter((network) => network.key === key)[0];
}

function renderBalances(balances: Array<Balance>, lpPrice: BigNumber) {
    return (
        <div className="">
            <div className="mb-3">Another balances</div>
            <div className="balances">
                {balances.map((balance) => {
                    return (
                        balance.key && (
                            <div className="balance" key={balance.key}>
                                {getNetworkByKey(balance.key).icon}
                                <div className="meta">
                                    <div className="chain">
                                        {getNetworkByKey(balance.key).value}
                                    </div>
                                    <div className="sum">
                                        {`$ ${getBalanceNumber(balance.value.multipliedBy(lpPrice))
                                            .toNumber()
                                            .toLocaleString('en')}`}
                                    </div>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>
        </div>
    );
}

export const YourData: React.FC<YourDataProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    account,
    lpPrice,
    balances,
    userMaxWithdraw,
    totalIncome,
    dailyProfit,
    monthlyProfit,
    yearlyProfit,
}) => {
    const balanceTarget = useRef(null);
    const [showApyHint, setShowApyHint] = useState(false);
    const [showBalanceHint, setShowBalanceHint] = useState(false);
    const balancePopover = (
        <Popover
            onMouseEnter={() => setShowBalanceHint(true)}
            onMouseLeave={() => setShowBalanceHint(false)}
        >
            <Popover.Body>{renderBalances(balances, lpPrice)}</Popover.Body>
        </Popover>
    );

    return (
        <div className={`Sidebar__Content__Data ${className ? className : ''}`}>
            <div className="title">Your data</div>
            <div className="values">
                <div className="balance">
                    <div className="title d-flex gap-2 justify-content-between">
                        <span>Balance</span>
                        <div
                            ref={balanceTarget}
                            onClick={() => setShowBalanceHint(!showApyHint)}
                            className={'hint'}
                        >
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                placement="right"
                                overlay={balancePopover}
                                show={showBalanceHint}
                            >
                                <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 13 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onMouseEnter={() => setShowBalanceHint(true)}
                                    onMouseLeave={() => setShowBalanceHint(false)}
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM6.23296 9.97261H4.98638L5.79002 7.12336H3.02741V5.87679H6.14162L6.94529 3.02741H8.19186L7.38819 5.87679L9.97261 5.87679V7.12336H7.03659L6.23296 9.97261Z"
                                        fill="white"
                                    />
                                </svg>
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className="value">
                        {!account && 'n/a'}
                        {account && userMaxWithdraw}
                    </div>
                </div>
                <div className="total-income">
                    <div className="title">Total income</div>
                    <div className="value">
                        {!account && 'n/a'}
                        {account && totalIncome}
                    </div>
                </div>
            </div>
            <div className="divider"></div>
            <div className="profits">
                <div className="daily">
                    <div className="title">Daily profit</div>
                    <div className="value vela-sans">
                        {`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD`}
                    </div>
                </div>
                <div className="monthly">
                    <div className="title">Monthly profit</div>
                    <div className="value vela-sans">
                        {`${monthlyProfit ? monthlyProfit.toFixed(2) : 0} USD`}
                    </div>
                </div>
                <div className="yearly">
                    <div className="title">Yearly profit</div>
                    <div className="value vela-sans">
                        {`${yearlyProfit ? yearlyProfit.toFixed(2) : 0} USD`}
                    </div>
                </div>
            </div>
        </div>
    );
};
