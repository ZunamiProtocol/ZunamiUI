import { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import './CollateralsPieChart.scss';
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

function renderStratList(items: Array<DataItem>, expanded: boolean) {
    if (items.length <= 5) {
        return;
    }

    const list = expanded ? items : items.slice(0, 5);

    return list.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div
                className={'PieChart__StratList__Item__Circle'}
                style={{ background: item.color }}
            />
            <div className={'PieChart__StratList__Item__Name d-flex align-items-center'}>
                {item.icon && <img src={item.icon} alt={item.title} className="me-2" />}
                <a target="blank" href={item.link}>
                    <div>{item.title.split(' - ')[0]}</div>
                    <div>{`(${item.value.toFixed(2)}%)`}</div>
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
    return `${entry.tooltip} - ${entry.value.toFixed(2)}%`;
}

export const CollateralsPieChart = (props: ChartProps): JSX.Element => {
    const [width, setWidth] = useState(screenWidthToChartWidth());
    const [hovered, setHovered] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState([-9999, -9999]);
    const [expanded, setExpanded] = useState(false);
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
        <div className={'CollateralChart'}>
            <div className={'PieChartWrapper'}>
                <PieChart
                    data={props.data}
                    totalValue={100}
                    lineWidth={width}
                    paddingAngle={0}
                    labelPosition={0}
                    className={'PieChart__Chart'}
                    onMouseOver={(e, index) => {
                        // debugger;
                        setTooltipPos([e.pageX + 10, e.pageY + 10]);
                        setHovered(index);
                    }}
                    onMouseOut={() => {
                        setHovered(null);
                        setTooltipPos([-99999, -99999]);
                    }}
                />
            </div>
            {!props.hideSummary && (
                <div className={'PieChart__StratList'}>
                    {renderStratList(props.data, expanded)}
                    {props.data.length > 0 && (
                        <div>
                            {expanded && (
                                <button
                                    className="CollateralChart__more"
                                    onClick={() => {
                                        setExpanded(false);
                                    }}
                                >
                                    less
                                </button>
                            )}
                            {!expanded && (
                                <button
                                    className="CollateralChart__more"
                                    onClick={() => {
                                        setExpanded(true);
                                    }}
                                >
                                    more
                                </button>
                            )}
                        </div>
                    )}
                    {props.data.length === 0 && <div className="text-left">no data</div>}
                </div>
            )}
            {
                <div
                    className="PieChart__Tooltip"
                    style={{ left: tooltipPos[0], top: tooltipPos[1] }}
                >
                    {typeof hovered === 'number' ? makeTooltipContent(data[hovered]) : ''}
                </div>
            }
        </div>
    );
};
