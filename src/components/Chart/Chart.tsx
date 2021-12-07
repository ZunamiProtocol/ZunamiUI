import { PieChart } from 'react-minimal-pie-chart';
import './Chart.scss';

interface DataItem {
    color: string;
    value: number;
    title: string;
}

interface ChartProps {
    data: Array<DataItem>;
}

function renderStratList(items: Array<DataItem>) {
    return items.map(item => 
        <div className={'PieChart__StratList__Item'}>
            <div
                className={'PieChart__StratList__Item__Circle'}
                style={{ background: item.color }}
            />
            <div className={'PieChart__StratList__Item__Name'}>{item.title}</div>
        </div>
    )
}

export const Chart = (props: ChartProps): JSX.Element => {
    return (
        <div className={'PieChart'}>
            <div className={'PieChart__Header'}>Current strategies</div>
            <div className={'PieChartWrapper'}>
                <PieChart
                    data={props.data}
                    totalValue={100}
                    lineWidth={30}
                    paddingAngle={5}
                    labelPosition={0}
                    className={'PieChart__Chart'}
                />
                <div className={'PieChartWrapper__Legend'}>
                    <div className={'PieChartWrapper__Legend__Counter'}>{props.data.length}</div>
                    <div className={'PieChartWrapper__Legend__Label'}>strategies</div>
                </div>
            </div>
            <div className={'PieChart__StratList'}>
                {
                    renderStratList(props.data)
                }
            </div>
        </div>
    );
};
