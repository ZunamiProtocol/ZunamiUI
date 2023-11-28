import { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import './PieChart.scss';
import { getPoolPrimaryIcon } from '../../functions/pools';
// import { getPoolPrimaryIcon } from '../../containers/Analytics';
// import 'react-tooltip/dist/';

interface DataItem {
    color: string;
    value: number;
    title: string;
    link: string;
    icon: string;
}

interface ChartProps {
    data: Array<DataItem>;
    hideSummary?: boolean;
    hideList?: boolean;
}

function renderStratList(items: Array<DataItem>) {
    return items.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div
                className={'PieChart__StratList__Item__Circle'}
                style={{ background: item.color }}
            />
            <div className={'PieChart__StratList__Item__Name d-flex align-items-center new-coin'}>
                {item.icon && (
                    <div className="wrapper">
                        {item && <img src={getPoolPrimaryIcon(item)} alt={item.title} />}
                        <div className="coin">
                            <img src={item.icon} alt={item.title} />
                        </div>
                        <div className="coin">
                            <img src="/curve-icon.svg" alt={item.title} />
                        </div>
                    </div>
                )}
                <a target="blank" href={item.link}>
                    <div>{item.title.split(' - ')[0]}</div>
                    <div>{item.title.split(' - ')[1]}</div>
                </a>
            </div>
        </div>
    ));
}

function screenWidthToChartWidth() {
    let width = 25;
    return width;
}

function makeTooltipContent(entry: any) {
    const nameParts = entry.tooltip.split(' - ');

    return (
        <div className="d-flex justify-content-center">
            <div className="circle" style={{ backgroundColor: entry.color }}></div>
            <div>
                <div className="platform">
                    {nameParts[0]} - {`${entry.value.toFixed(2)}%`}
                </div>
                <div className="pool">{nameParts[1]}</div>
            </div>
        </div>
    );
}

export const PieChart2 = (props: ChartProps): JSX.Element => {
    const [width, setWidth] = useState(screenWidthToChartWidth());
    const [hovered, setHovered] = useState<number | null>(null);
    const data = props.data.map(({ title, ...entry }) => {
        return {
            ...entry,
            tooltip: title,
        };
    });

    useEffect(() => {
        window.addEventListener('resize', (e) => {
            setWidth(screenWidthToChartWidth());
        });
    }, []);

    return (
        <div className={'PieChart2'}>
            <div className={'PieChartWrapper'}>
                <PieChart
                    data={props.data}
                    totalValue={100}
                    lineWidth={width}
                    paddingAngle={0}
                    labelPosition={0}
                    className={'PieChart__Chart'}
                    onMouseOver={(_, index) => {
                        setHovered(index);
                    }}
                    onMouseOut={() => {
                        setHovered(null);
                    }}
                />
                <div className={'PieChartWrapper__Legend'}>
                    {!props.hideSummary && (
                        <div className={'PieChartWrapper__Legend__Counter'}>
                            {props.data.length}
                        </div>
                    )}
                    {!props.hideSummary && (
                        <div className={'PieChartWrapper__Legend__Label'}>
                            {props.data.length > 1 ? 'strategies' : 'strategy'}
                        </div>
                    )}
                </div>
            </div>
            {!props.hideSummary && (
                <div className={'PieChart__StratList'}>{renderStratList(props.data)}</div>
            )}
            {
                <div className="PieChart__Tooltip">
                    {typeof hovered === 'number' ? makeTooltipContent(data[hovered]) : ''}
                </div>
            }
        </div>
    );
};
