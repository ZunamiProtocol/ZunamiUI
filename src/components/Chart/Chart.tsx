import './Chart.scss';

interface DataItem {
    color: string;
    value: number;
    title: string;
    link: string;
    icon: string;
}

interface ChartProps {
    data: Array<DataItem>;
    title;
}

function renderStratList(items: Array<DataItem>) {
    return items.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div className="d-flex">
                <img src={item.icon} alt={item.title} className="me-2" />
                <a target="blank" href={item.link}>
                    {item.title}
                </a>
                <span className="size">{`${item.value.toFixed(1)}%`}</span>
            </div>
            <div>
                <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${item.value.toFixed(1)}%`,
                            backgroundColor: item.color,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    ));
}

export const Chart: React.FC<ChartProps & React.HTMLProps<HTMLDivElement>> = ({
    data,
    className,
    title,
}) => {
    return (
        <div className={`PieChart ${className}`}>
            <div className={'PieChart__Header'}>
                <span>{title}</span>
            </div>
            <div className={'PieChart__StratList'}>{renderStratList(data)}</div>
        </div>
    );
};
