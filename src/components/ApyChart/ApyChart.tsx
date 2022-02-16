import {useState} from 'react';
import './ApyChart.scss';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from "date-fns";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartProps {
    data: Array<any>;
    onRangeChange?: Function;
}

interface RangeItem {
    value: String;
    title: String;
}

function onRangeChange(e: any, handler: Function|undefined) {
    const range = e.target.dataset.range;

    if (handler) {
        handler(range);
    }
}

function renderRanges(items: Array<RangeItem>, currentState: string, onChangeHandler: Function|undefined) {
    return items.map((item: RangeItem, index: number) =>
        <span
            key={index}
            className={currentState === item.value ? 'active' : ''}
            data-range={item.value}
            onClick={(e) => {
                onRangeChange(e, onChangeHandler);
            }}
        >{item.title}</span>
    );
}

const ranges = [
    { value: 'week', title: '1 week' },
    { value: 'month', title: '1 month' },
    { value: 'all', title: 'All time' },
];

const chartOptions = {
    responsive: true,
    radius: 0,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
          grid: {
            display: false,
          }
        },
        y: {
            grid: {
              display: false,
            },
            min: 0,
            max: 18,
            ticks: {
                //@ts-ignore
                callback: function(val) {
                  return `${val}%`;
                },
                stepSize: 3,
            }
        }
    },
};

export const ApyChart = (props: ChartProps): JSX.Element => {
    const [currentRange, setCurrentRange] = useState('week');

    const data = {
        labels: props.data.map((item) => {
            return format(item.timestamp * 1000, 'E d');
        }),
        datasets: [
            {
                label: 'Dataset 1',
                data: props.data.map((item) => item.apy),
                borderColor: '#FA5B06',
            },
        ],
    };

    return (
        <div className={'ApyChart'}>
            <div className="ApyChart__Header">
                <div className="ApyChart__Title">Historical Realised APY</div>
                <div className="ApyChart__Selector">
                    {
                        renderRanges(ranges, currentRange, (e: string) => {
                            setCurrentRange(e);

                            if (props.onRangeChange) {
                                props.onRangeChange(e);
                            }
                        })
                    }
                </div>
            </div>
            <Line className="ApyChart__Chart" options={chartOptions} data={data} />
        </div>
    );
};
