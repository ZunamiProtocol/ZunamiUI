import './Chart.scss';

interface DataItem {
    color: string;
    value: number;
    title: string;
    link: string;
    icon: string;
    type: string;
}

interface ChartProps {
    data: Array<DataItem>;
    title: string;
}

function getSecondIcon(item): string {
    let result = 'convex.svg';

    switch (item.type) {
        case 'FRAX_STAKEDAO':
            result = 'stake-dao.svg';
            break;
        case 'CONVEX_FRAX':
            result = 'convex.svg';
            break;
        default:
            result = item.icon;
            break;
    }

    return result;
}

function getPrimaryIcon(item): string {
    let result = 'convex.svg';

    switch (item.type) {
        case 'EUSD_FRAXBP':
            result = 'eusd.png';
            break;
        case 'ALUSD_FRAXBP':
            result = 'alUSD.png';
            break;
        case 'XAI_FRAXBP':
            result = 'frax.png';
            break;
        case 'CLEVUSD_FRAXBP':
            result = 'clever_analytics.png';
            break;
        default:
            result = item.icon;
            break;
    }

    return result;
}

function renderStratList(items: Array<DataItem>) {
    console.log(items);
    return items.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div className="d-flex">
                <div className="wrapper me-2">
                    <img src={getPrimaryIcon(item)} alt={item.title} />
                    {item.type !== 'VAULT' && (
                        <div className="coin">
                            <img src={getSecondIcon(item)} alt={item.title} />
                        </div>
                    )}
                    {item.type !== 'VAULT' && (
                        <div className="coin">
                            <img src="/curve-icon.svg" alt={item.title} />
                        </div>
                    )}
                </div>
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
