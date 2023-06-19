import { format } from 'date-fns';
import { useWallet } from 'use-wallet';
import './RebaseHistory.scss';
import { getScanAddressByChainId } from '../../utils/zunami';

interface TransactionHistoryProps {
    items?: Array<any>;
    onPageEnd?: Function;
    emptyText: string;
}

interface TransactionItem {
    dai: Number;
    usdc: Number;
    usdt: Number;
    dateTime: String;
    transactionHash: String;
    status: String;
    type: string;
}

/**
 * Returns an icon for transaction
 * @param transaction
 * @returns
 */
function getIconFromTransaction(transaction: TransactionItem) {
    let icon = 'USDT';
    let coinsCount = 0;

    ['dai', 'usdc', 'usdt'].forEach((coin) => {
        if (transaction[coin] > 0) {
            coinsCount++;
        }
    });

    if (transaction.dai > 0) {
        icon = 'DAI';
    } else if (transaction.usdc > 0) {
        icon = 'USDC';
    } else if (transaction.busd > 0) {
        icon = 'BUSD';
    }

    if (transaction.lpAmount !== null) {
        icon = 'LP';
    }

    if (['RECEIVED', 'SENT'].indexOf(transaction.type) !== -1) {
        icon = 'uzd';
    }

    if (transaction.hasOwnProperty('type') && transaction.type === 'MINT') {
        icon = 'UZD';
    }

    if (transaction.hasOwnProperty('type') && transaction.type === 'REDEEM') {
        icon = 'LP';
    }

    return icon;
}

export const RebaseHistory: React.FC<TransactionHistoryProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    items,
    onPageEnd,
    emptyText,
    type,
}) => {
    const { chainId } = useWallet();

    const onScroll = (e: any) => {
        const areaHeight = e.target.offsetHeight;
        const totalScroll = e.target.scrollTop + areaHeight;
        const fullHeight = e.target.children[0].offsetHeight;

        if (totalScroll >= fullHeight) {
            if (onPageEnd) {
                onPageEnd();
            }
        }
    };

    return (
        <div className={`RebaseHistory ${className}`}>
            <div className="d-flex header">
                <div>Date</div>
                <div>{type} price</div>
                <div>Change</div>
            </div>
            <div className="RebaseHistory__List" onScroll={onScroll}>
                {items &&
                    items.map((item, index) => (
                        <div className="RebaseHistory__List-Item d-flex" key={index}>
                            <div className="date text-center">
                                {format(new Date(item.dateTime), 'd MMM yyyy, h:mm')}
                            </div>
                            <div className="price text-center">{item.assetPrice.toFixed(8)}</div>
                            <div className="percent text-center">{item.priceDeltaPercentage}%</div>
                        </div>
                    ))}
                {!items.length && (
                    <div className="text-center empty">
                        <svg
                            width="130"
                            height="24"
                            viewBox="0 0 130 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="130" height="24" rx="12" fill="#E4E4E4" />
                        </svg>
                        <div className="">{emptyText}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
