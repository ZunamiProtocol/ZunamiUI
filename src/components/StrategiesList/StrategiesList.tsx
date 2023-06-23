import { format } from 'date-fns';
import { useWallet } from 'use-wallet';
import './StrategiesList.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../utils/formatbalance';

interface StrategiesListProps {
    title: any;
    items?: Array<Strategy>;
    tvl: number;
}

interface Strategy {
    name: String;
    desc: string;
    amount: BigNumber;
    apr: number;
    tvlInZunami: number;
    type: string;
}

function renderStratHeader(item: Strategy) {
    let icon = '';
    let title = '';
    let desc = '';

    switch (item.type) {
        case 'XAI_FRAXBP':
            icon = '/convex.svg';
            title = 'Convex finance';
            desc = 'XAI/FRAXBP Pool';
            break;
        case 'CLEVUSD_FRAXBP':
            icon = '/convex.svg';
            title = 'Convex finance';
            desc = 'clevUSD/FRAXBP Pool';
            break;
        case 'EUSD_FRAXBP':
            icon = '/eusd.svg';
            title = 'Convex Frax Booster';
            desc = 'eUSD/FRAXBP';
            break;
        case 'STAKE_DAO_MIM':
            icon = '/stake-dao.svg';
            title = 'Stake DAO';
            desc = 'MIM pool';
            break;
        case 'ALUSD_FRAXBP':
            icon = '/convex.svg';
            title = 'Convex Frax Booster';
            desc = 'alUSD/FRAXBP';
            break;
    }

    const stratIcon =
        item.analytics && item.analytics.data.coinsMarketData.stableCoin
            ? item.analytics.data.coinsMarketData.stableCoin.image
            : '/clever.svg';

    return (
        <div className="d-flex gap-2 header">
            {
                <div className="new-coin">
                    <div className="wrapper">
                        <img src={stratIcon} alt={item.title} />
                        <div className="coin">
                            <img src={icon} alt={item.title} />
                        </div>
                        <div className="coin">
                            <img src="/curve-icon.svg" alt={item.title} />
                        </div>
                    </div>
                </div>
            }
            <span className="title">{title}</span>
            <span className="desc">{desc}</span>
        </div>
    );
}

export const StrategiesList: React.FC<StrategiesListProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    title,
    items,
    tvl,
}) => {
    const totalTvl = items
        ?.map((item) => item.tvlInZunami)
        .reduce((partialSum, a) => partialSum + a, 0);
    return (
        <div className={`StrategiesList ${className}`}>
            <div className="StrategiesList__Title">{title}</div>
            <div className="StrategiesList__List">
                {items?.map((item, itemIndex: number) => (
                    <div className="StrategiesList__List-Item" key={itemIndex}>
                        {renderStratHeader(item)}
                        <div className="d-flex props">
                            <div className="block">
                                <div className="title">Amount, $</div>
                                <div className="value">
                                    {Number(
                                        (((item.tvlInZunami / totalTvl) * 100).toFixed(2) *
                                            getFullDisplayBalance(tvl)) /
                                            100
                                    ).toLocaleString('en', {
                                        maximumFractionDigits: 0,
                                    })}
                                </div>
                            </div>
                            <div className="block">
                                <div className="title">Share, %</div>
                                <div className="value">
                                    {((item.tvlInZunami / totalTvl) * 100).toFixed(2)}
                                </div>
                            </div>
                            <div className="block">
                                <div className="title">APR, %</div>
                                <div className="value">{item.apr.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
