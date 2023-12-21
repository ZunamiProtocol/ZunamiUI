import { useState, useRef } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ReactComponent as HintIcon } from '../../assets/info.svg';
import './StrategyListItem.scss';
import { MicroCard } from '../MicroCard/MicroCard';

interface StrategyListItemProps {
    title: string;
    description: string;
    percent: number;
    value?: string;
    children?: string | JSX.Element | JSX.Element[];
    color: keyof typeof StrategyListItemColor;
    amount: string;
    apr: number;
}

export const StrategyListItemColor = {
    yellow: 'yellow',
    blue: 'blue',
    green: 'green',
    orange: 'orange',
} as const;

function colorToHex(color: string) {
    let result = '';

    switch (color) {
        case StrategyListItemColor.yellow:
            result = '#FFD118';
            break;
        case StrategyListItemColor.blue:
            result = '#12A0FE';
            break;
        case StrategyListItemColor.green:
            result = '#B2FE12';
            break;
        case StrategyListItemColor.orange:
            result = '#FC6505';
            break;
    }

    return result;
}

export const StrategyListItem: React.FC<
    StrategyListItemProps & React.HTMLProps<HTMLDivElement>
> = ({ className, title, description, percent, color, amount, apr }): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    return (
        <div className={`strategy-list-item ${className ?? ''}`}>
            <div className="">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="wrapper me-3">
                        <img src="frax.svg" alt="" />
                        <div className="coin">
                            <img src="/convex.svg" alt="" />
                        </div>
                        <div className="coin">
                            <img src="/curve-icon.svg" alt="" />
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        <div className="name">{title}</div>
                        <div className="description">{description}</div>
                    </div>
                    <div className="percent-val">{percent}%</div>
                </div>
            </div>
            <div className="d-flex gap-2">
                <MicroCard title="Amount" value={amount} className="align-items-start flex-even" />
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
                            backgroundColor: colorToHex(color),
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
