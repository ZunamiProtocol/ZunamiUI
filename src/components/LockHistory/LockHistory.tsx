import { format } from 'date-fns';
// import { useWallet } from 'use-wallet';
import './LockHistory.scss';
import { getScanAddressByChainId } from '../../utils/zunami';

interface TransactionHistoryProps {
    items: Array<any>;
    onPageEnd?: Function;
    emptyText: string;
    columns: Array<string>;
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

export const LockHistory: React.FC<TransactionHistoryProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    items,
    onPageEnd,
    emptyText,
    columns,
}) => {
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
        <div className={`LockHistory ${className}`}>
            <div className="d-flex header">
                {columns.map((column: string, key: number) => (
                    <div key={key}>{column}</div>
                ))}
            </div>
            <div className="LockHistory__List" onScroll={onScroll}>
                {items &&
                    items.map((item, index) => (
                        <div className="LockHistory__List-Item d-flex" key={index}>
                            <div className="date text-center">
                                {format(new Date(item.dateTime), 'd MMM yyyy, h:mm')}
                            </div>
                            <div className="price text-center">{item.assetPrice.toFixed(8)}</div>
                            <div className="percent text-center">{item.priceDeltaPercentage}%</div>
                        </div>
                    ))}
                {!items.length && (
                    <div className="text-center empty">
                        {/* <svg
                            width="130"
                            height="24"
                            viewBox="0 0 130 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="130" height="24" rx="12" fill="#E4E4E4" />
                        </svg> */}
                        <div className="">{emptyText}</div>
                    </div>
                )}
            </div>
        </div>
    );
};