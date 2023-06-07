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
    title?: string;
    orientation?: string;
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

function renderStratList(items: Array<DataItem>, orientation: string) {
    return items.map((item, index) => (
        <div key={index} className={'PieChart__StratList__Item'}>
            <div className="d-flex">
                <div className="wrapper me-2">
                    <img src={item.icon} alt={item.title} />
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
                    {orientation === 'list' && item.title}
                    {orientation === 'column' && item.title !== 'UZD Vault' && (
                        <div>
                            <div>{item.title.split('-')[0]}</div>
                            <div className="strat-desc">
                                {item.title.split('-')[1].replace(' pool', '')}
                            </div>
                        </div>
                    )}
                    {orientation === 'column' && item.title === 'UZD Vault' && (
                        <div>
                            <div>{item.title}</div>
                            <div>-</div>
                        </div>
                    )}
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
    orientation = 'list',
}) => {
    return (
        <div className={`PieChart ${className}`}>
            {title && (
                <div className={'PieChart__Header'}>
                    <span>{title}</span>
                </div>
            )}
            <div className={`d-flex PieChart__StratList ${orientation}`}>
                {renderStratList(data, orientation)}
            </div>
        </div>
    );
};
