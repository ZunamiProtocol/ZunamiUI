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
    if (key === 'APS') {
        return {
            icon: (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.82662 0.656319C3.37418 1.28395 2.14047 2.32819 1.2815 3.65699C0.422534 4.98578 -0.02311 6.53945 0.000923282 8.12151C0.0249566 9.70358 0.517587 11.243 1.41652 12.5451C2.31545 13.8472 3.58031 14.8535 5.05115 15.4367C6.52199 16.0199 8.13274 16.1539 9.67972 15.8217C11.2267 15.4894 12.6404 14.706 13.7421 13.5703C14.8438 12.4346 15.584 10.9977 15.8691 9.44136C16.1542 7.885 15.9713 6.27906 15.3437 4.82662C14.9269 3.86223 14.3243 2.98937 13.5703 2.25787C12.8162 1.52637 11.9254 0.950564 10.9488 0.563315C9.97225 0.176067 8.92894 -0.0150347 7.87848 0.000922995C6.82803 0.0168807 5.79101 0.239585 4.82662 0.656319Z"
                        fill="url(#paint0_linear_74_125856)"
                    />
                    <path
                        d="M12.4766 9.36382L12.2323 8.90048C12.1887 8.81839 12.1144 8.75689 12.0256 8.72942C11.9368 8.70194 11.8407 8.71072 11.7584 8.75384L9.42325 9.98528L8.29203 7.84016L10.0062 3.70569C10.025 3.65319 10.0333 3.59749 10.0305 3.54178C10.0278 3.48607 10.014 3.43146 9.99008 3.38109L9.74574 2.91774C9.70215 2.83566 9.62784 2.77416 9.53905 2.74668C9.45025 2.7192 9.35419 2.72798 9.27185 2.7711L6.41372 4.27835L5.81859 3.14982C5.775 3.06774 5.70069 3.00624 5.6119 2.97876C5.52311 2.95129 5.42706 2.96006 5.34472 3.00317L4.88136 3.24752C4.79928 3.29112 4.73779 3.36543 4.71032 3.45421C4.68284 3.543 4.69162 3.63905 4.73472 3.72139L5.32985 4.84992L3.66994 5.72526C3.58786 5.76886 3.52636 5.84317 3.49888 5.93196C3.4714 6.02075 3.48018 6.1168 3.52328 6.19915L3.76763 6.66249C3.81123 6.74457 3.88554 6.80606 3.97433 6.83354C4.06312 6.86102 4.15917 6.85224 4.24151 6.80913L5.90142 5.93379L6.93966 7.90259L5.13615 12.2527C5.116 12.3034 5.1072 12.358 5.11036 12.4125C5.11351 12.467 5.12856 12.5201 5.15443 12.5682C5.16486 12.5874 5.1713 12.6008 5.18089 12.619L5.42523 13.0824C5.46883 13.1644 5.54314 13.2259 5.63193 13.2534C5.72072 13.2809 5.81678 13.2721 5.89912 13.229L8.91096 11.6407L9.28312 12.3464C9.32672 12.4285 9.40103 12.49 9.48982 12.5175C9.57861 12.545 9.67467 12.5362 9.75701 12.4931L10.2203 12.2487C10.3024 12.2051 10.3639 12.1308 10.3914 12.042C10.4189 11.9532 10.4101 11.8572 10.367 11.7748L9.99483 11.0691L12.33 9.8377C12.4121 9.79411 12.4736 9.7198 12.501 9.63101C12.5285 9.54222 12.5197 9.44616 12.4766 9.36382V9.36382ZM6.98529 5.3622L8.27485 4.68217L7.5494 6.43192L6.98529 5.3622ZM6.83729 11.349L7.6823 9.31083L8.33939 10.5568L6.83729 11.349Z"
                        fill="white"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_74_125856"
                            x1="9.2459"
                            y1="1.27816"
                            x2="6.66481"
                            y2="15.2224"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FFB515" />
                            <stop offset="0.19046" stopColor="#FF931C" />
                            <stop offset="0.41364" stopColor="#FF7322" />
                            <stop offset="0.62821" stopColor="#FF5B26" />
                            <stop offset="0.82823" stopColor="#FF4D29" />
                            <stop offset="0.99932" stopColor="#FF482A" />
                        </linearGradient>
                    </defs>
                </svg>
            ),
            value: 'UZD',
        };
    }

    if (key === 'ZETH') {
        return {
            icon: (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.82662 0.656319C3.37418 1.28395 2.14047 2.32819 1.2815 3.65699C0.422534 4.98578 -0.02311 6.53945 0.000923282 8.12151C0.0249566 9.70358 0.517587 11.243 1.41652 12.5451C2.31545 13.8472 3.58031 14.8535 5.05115 15.4367C6.52199 16.0199 8.13274 16.1539 9.67972 15.8217C11.2267 15.4894 12.6404 14.706 13.7421 13.5703C14.8438 12.4346 15.584 10.9977 15.8691 9.44136C16.1542 7.885 15.9713 6.27906 15.3437 4.82662C14.9269 3.86223 14.3243 2.98937 13.5703 2.25787C12.8162 1.52637 11.9254 0.950564 10.9488 0.563315C9.97225 0.176067 8.92894 -0.0150347 7.87848 0.000922995C6.82803 0.0168807 5.79101 0.239585 4.82662 0.656319Z"
                        fill="url(#paint0_linear_74_125856)"
                    />
                    <path
                        d="M12.4766 9.36382L12.2323 8.90048C12.1887 8.81839 12.1144 8.75689 12.0256 8.72942C11.9368 8.70194 11.8407 8.71072 11.7584 8.75384L9.42325 9.98528L8.29203 7.84016L10.0062 3.70569C10.025 3.65319 10.0333 3.59749 10.0305 3.54178C10.0278 3.48607 10.014 3.43146 9.99008 3.38109L9.74574 2.91774C9.70215 2.83566 9.62784 2.77416 9.53905 2.74668C9.45025 2.7192 9.35419 2.72798 9.27185 2.7711L6.41372 4.27835L5.81859 3.14982C5.775 3.06774 5.70069 3.00624 5.6119 2.97876C5.52311 2.95129 5.42706 2.96006 5.34472 3.00317L4.88136 3.24752C4.79928 3.29112 4.73779 3.36543 4.71032 3.45421C4.68284 3.543 4.69162 3.63905 4.73472 3.72139L5.32985 4.84992L3.66994 5.72526C3.58786 5.76886 3.52636 5.84317 3.49888 5.93196C3.4714 6.02075 3.48018 6.1168 3.52328 6.19915L3.76763 6.66249C3.81123 6.74457 3.88554 6.80606 3.97433 6.83354C4.06312 6.86102 4.15917 6.85224 4.24151 6.80913L5.90142 5.93379L6.93966 7.90259L5.13615 12.2527C5.116 12.3034 5.1072 12.358 5.11036 12.4125C5.11351 12.467 5.12856 12.5201 5.15443 12.5682C5.16486 12.5874 5.1713 12.6008 5.18089 12.619L5.42523 13.0824C5.46883 13.1644 5.54314 13.2259 5.63193 13.2534C5.72072 13.2809 5.81678 13.2721 5.89912 13.229L8.91096 11.6407L9.28312 12.3464C9.32672 12.4285 9.40103 12.49 9.48982 12.5175C9.57861 12.545 9.67467 12.5362 9.75701 12.4931L10.2203 12.2487C10.3024 12.2051 10.3639 12.1308 10.3914 12.042C10.4189 11.9532 10.4101 11.8572 10.367 11.7748L9.99483 11.0691L12.33 9.8377C12.4121 9.79411 12.4736 9.7198 12.501 9.63101C12.5285 9.54222 12.5197 9.44616 12.4766 9.36382V9.36382ZM6.98529 5.3622L8.27485 4.68217L7.5494 6.43192L6.98529 5.3622ZM6.83729 11.349L7.6823 9.31083L8.33939 10.5568L6.83729 11.349Z"
                        fill="white"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_74_125856"
                            x1="9.2459"
                            y1="1.27816"
                            x2="6.66481"
                            y2="15.2224"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FFB515" />
                            <stop offset="0.19046" stopColor="#FF931C" />
                            <stop offset="0.41364" stopColor="#FF7322" />
                            <stop offset="0.62821" stopColor="#FF5B26" />
                            <stop offset="0.82823" stopColor="#FF4D29" />
                            <stop offset="0.99932" stopColor="#FF482A" />
                        </linearGradient>
                    </defs>
                </svg>
            ),
            value: 'ZETH',
        };
    }

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
                                        {`$ ${getBalanceNumber(balance.value)
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
