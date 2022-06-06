import { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import './Chart.scss';
import { is1024, is1440, is1920 } from '../../functions/screen';

interface DataItem {
    color: string;
    value: number;
    title: string;
    link: string;
    icon: string;
}

interface ChartProps {
    data: Array<DataItem>;
}

function renderStratList(items: Array<DataItem>) {
    return items.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div
                className={'PieChart__StratList__Item__Circle'}
                style={{ background: item.color }}
            />
            <div className={'PieChart__StratList__Item__Name d-flex align-items-center'}>
                <img src={item.icon} alt={item.title} className="me-2" />
                <a target="blank" href={item.link}>
                    {item.title}
                    {` (${item.value.toFixed(1)}%)`}
                </a>
            </div>
        </div>
    ));
}

function screenWidthToChartWidth() {
    let width = 34;

    if (is1024()) {
        width = 34;
    }

    if (is1440()) {
        width = 33;
    }

    if (is1920()) {
        width = 34;
    }

    return width;
}

export const Chart = (props: ChartProps): JSX.Element => {
    const [width, setWidth] = useState(screenWidthToChartWidth());

    useEffect(() => {
        window.addEventListener('resize', (e) => {
            setWidth(screenWidthToChartWidth());
        });
    }, []);

    return (
        <div className={'PieChart'}>
            <div className={'PieChart__Header'}>Current strategies</div>
            <div className={'PieChartWrapper'}>
                <PieChart
                    data={props.data}
                    totalValue={100}
                    lineWidth={width}
                    paddingAngle={0}
                    labelPosition={0}
                    className={'PieChart__Chart'}
                />
                <div className={'PieChartWrapper__Legend'}>
                    <div className={'PieChartWrapper__Legend__Counter'}>{props.data.length}</div>
                    <div className={'PieChartWrapper__Legend__Label'}>
                        {props.data.length > 1 ? 'strategies' : 'strategy'}
                    </div>
                </div>
            </div>
            <div className={'PieChart__StratList'}>{renderStratList(props.data)}</div>
        </div>
    );
};
