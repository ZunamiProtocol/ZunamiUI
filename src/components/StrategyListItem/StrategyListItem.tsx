import './StrategyListItem.scss';
import { MicroCard } from '../MicroCard/MicroCard';

interface StrategyListItemProps {
    title: string;
    description: string;
    percent: number;
    value?: string;
    children?: string | JSX.Element | JSX.Element[];
    color: string;
    amount: number;
    apr: number;
    icon: string;
    primaryIcon: string;
    secondaryIcon: string;
}

export const StrategyListItem: React.FC<
    StrategyListItemProps & React.HTMLProps<HTMLDivElement>
> = ({
    className,
    title,
    description,
    percent,
    color,
    amount,
    apr,
    icon,
    primaryIcon,
    secondaryIcon,
}): JSX.Element => {
    return (
        <div className={`strategy-list-item ${className ?? ''}`}>
            <div className="">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="wrapper me-3">
                        <img src={icon} alt="" />
                        <div className="coin">
                            <img src={primaryIcon} alt="" />
                        </div>
                        <div className="coin">
                            <img src={secondaryIcon} alt="" />
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        <div className="name">{title}</div>
                        <div className="description">{description}</div>
                    </div>
                    <div className="percent-val">{percent.toFixed(2)}%</div>
                </div>
            </div>
            <div className="d-flex gap-2">
                <MicroCard
                    title="Amount"
                    value={amount.toLocaleString('en', {
                        maximumFractionDigits: 0,
                    })}
                    className="align-items-start flex-even"
                />
                <MicroCard title="APR" value={`${apr}%`} className="align-items-start flex-even" />
            </div>
            <div className="t2hird-row mt-3">
                <div
                    className="progress"
                    style={{
                        width: '100%',
                        height: '4px',
                    }}
                >
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${percent}%`,
                            backgroundColor: color,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
