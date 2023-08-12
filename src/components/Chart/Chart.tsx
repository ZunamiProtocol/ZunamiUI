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
        case 'STAKEDAO_CRVUSD_USDT':
            result = 'stake-dao.svg';
            break;
        case 'CONVEX_FRAX':
            result = 'convex.svg';
            break;
        case 'ALETH_FRAXETH':
            result = 'frx_eth.png';
            break;
        case 'SETH_FRAXETH':
            result = 'seth.png';
            break;
        case 'FRAXETH':
            result = 'frax.svg';
            break;
        case 'STETH_FRAXETH':
            result = 'steth.png';
            break;
        case 'CONCENTRATOR_FRAX':
            result = 'frax.svg';
            break;
        case 'CONVEX_FRAX_STAKING':
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
        case 'FRAXETH':
            result = 'zeth-vault.svg';
            break;
        case 'STETH_FRAXETH':
            result = 'frx_eth.png';
            break;
        case 'CONCENTRATOR_FRAX':
            result = 'uzd.svg';
            break;
        default:
            result = item.icon;
            break;
    }

    if (item.type === 'VAULT' && item.address === '0xDc0B52c04CdC0099aeFcCa8B0675A00cF8f6d7dC') {
        result = 'zeth-vault.svg';
    }
    return result;
}

function renderStratName(orientation, item) {
    let result = item.title;
    const isZethVault = item.address === '0xDc0B52c04CdC0099aeFcCa8B0675A00cF8f6d7dC';
    const titleParts = item.title.split('-');

    if (titleParts.length >= 2) {
        titleParts[1].replace(' pool', '');
    }

    if (orientation === 'column') {
        if (item.title !== 'UZD Vault') {
            result = (
                <div>
                    <div>{titleParts[0]}</div>
                    <div className="strat-desc">{titleParts[1]}</div>
                </div>
            );
        } else {
            if (!isZethVault) {
                result = (
                    <div>
                        <div>{item.title}</div>
                        <div>-</div>
                    </div>
                );
            } else {
                result = (
                    <div>
                        <div>Vault</div>
                        <div>-</div>
                    </div>
                );
            }
        }
    } else {
        if (isZethVault) {
            result = 'Vault';
        }
    }

    return result;
}

function renderStratList(items: Array<DataItem>, orientation: string) {
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
                    {renderStratName(orientation, item)}
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
                {!data.length && <div className="text-muted mt-3">no strategies yet</div>}
                {renderStratList(data, orientation)}
            </div>
        </div>
    );
};
