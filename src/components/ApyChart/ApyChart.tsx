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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const labels = ['Mon 27', 'Tue 28', 'Wen 29', 'Fri 30', 'Sat 01', 'Sun 02'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Dataset 1',
            data: labels.map(() => (Math.random() * 10) + 5),
            borderColor: '#FA5B06',
        },
    ],
};

interface ChartProps {
    // data: Array<DataItem>;
}


export const ApyChart = (props: ChartProps): JSX.Element => {
    const options = {
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

    return (
        <div className={'ApyChart'}>
            <div className="ApyChart__Header">
                <div className="ApyChart__Title">Historical Realised APY</div>
                <div className="ApyChart__Selector">
                    <span className="active">1 week</span>
                    <span>1 month</span>
                    <span>All time</span>
                </div>
            </div>
            <Line className="ApyChart__Chart" options={options} data={data} />
        </div>
    );
};
