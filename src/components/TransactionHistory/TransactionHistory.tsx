import { format } from 'date-fns';
import { useWallet } from 'use-wallet';
import './TransactionHistory.scss';

interface TransactionHistoryProps {
    title: any;
    section: string;
    items?: Array<any>;
    onPageEnd?: Function;
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

    if (coinsCount > 1) {
        icon = 'all-coins';
    }

    if (['RECEIVED', 'SENT'].indexOf(transaction.type) !== -1) {
        icon = 'uzd';
    }

    return icon;
}

/**
 * Returns a coin name for transaction
 * @param transaction
 * @returns
 */
function getCoinNameFromTransaction(
    transaction: TransactionItem,
    section: string
): string {
    let name = 'USDT';
    let coinsCount = 0;

    ['dai', 'usdc', 'usdt'].forEach((coin) => {
        if (transaction[coin] > 0) {
            coinsCount++;
        }
    });

    if (transaction.dai > 0) {
        name = 'DAI';
    } else if (transaction.usdc > 0) {
        name = 'USDC';
    } else if (transaction.busd > 0) {
        name = 'BUSD';
    }

    if (coinsCount > 1) {
        name = 'All';
    }

    if (['RECEIVED', 'SENT'].indexOf(transaction.type) !== -1) {
        if (['DEPOSIT', 'WITHDRAW'].indexOf(section.toUpperCase()) !== -1) {
            name = 'ZLP';
        } else {
            name = 'UZD';
        }
    }

    return name;
}

export const TransactionHistory = (props: TransactionHistoryProps): JSX.Element => {
    const { chainId } = useWallet();

    const onScroll = (e: any) => {
        const areaHeight = e.target.offsetHeight;
        const totalScroll = e.target.scrollTop + areaHeight;
        const fullHeight = e.target.children[0].offsetHeight;

        if (totalScroll >= fullHeight) {
            if (props.onPageEnd) {
                props.onPageEnd();
            }
        }
    };

    return (
        <div className={'TransactionHistory'}>
            <div className="TransactionHistory__Title">{props.title}</div>
            <div className="TransactionHistory__List" onScroll={onScroll}>
                <table className="">
                    <thead>
                        <tr>
                            <th>Coin</th>
                            <th>Value</th>
                            <th>Type</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.items &&
                            props.items.map((item) => (
                                <tr key={item.dateTime}>
                                    <td>
                                        <img
                                            src={`${getIconFromTransaction(item)}.svg`}
                                            className="icon"
                                            alt=""
                                        />
                                        <span className="ms-1">{getCoinNameFromTransaction(item, props.section)}</span>
                                    </td>
                                    <td>{`${item.value ? `$${item.value.toFixed(2)}` : ''}`}</td>
                                    <td>{item.type}</td>
                                    <td>{format(new Date(item.dateTime), 'd MMM, yyyy, h:mm a')}</td>
                                    <td
                                        className={`${item.status} d-flex align-items-center justify-content-end status-col`}
                                    >
                                        <span>{item.status}</span>
                                        <a
                                            href={`https://${
                                                chainId === 1 ? 'etherscan.io' : 'bscscan.com'
                                            }/tx/${item.transactionHash}`}
                                            rel="noreferrer"
                                            target="_blank"
                                            className="trans-link"
                                        >
                                            <svg
                                                width="12"
                                                height="13"
                                                viewBox="0 0 12 13"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M0.189913 6.98041C0.189917 5.81998 0.189765 4.65956 0.189455 3.49913C0.188963 3.07436 0.305502 2.68921 0.571329 2.35536C0.85713 1.99642 1.22632 1.77347 1.68206 1.7039C1.79636 1.68733 1.91173 1.67935 2.02722 1.68C3.27369 1.67836 4.52016 1.67804 5.76663 1.67903C5.79648 1.67903 5.8264 1.67857 5.85616 1.68039C6.01336 1.69002 6.13693 1.79993 6.14101 1.95661C6.1484 2.23998 6.14771 2.52377 6.14154 2.80719C6.13826 2.95737 6.02051 3.07101 5.87079 3.08784C5.82986 3.09102 5.78879 3.09192 5.74776 3.09053C4.51622 3.09065 3.28464 3.09571 2.05316 3.08709C1.74187 3.08491 1.59814 3.26299 1.59881 3.54613C1.60419 5.83712 1.60415 8.12811 1.59869 10.4191C1.59789 10.7329 1.76539 10.8855 2.05964 10.8848C4.35478 10.8795 6.64993 10.8783 8.94509 10.8815C8.99724 10.8829 9.04941 10.8795 9.10091 10.8712C9.27062 10.8387 9.38267 10.7085 9.39322 10.5364C9.3955 10.4992 9.39444 10.4618 9.39444 10.4245C9.39449 9.26031 9.39452 8.09616 9.39452 6.932C9.39452 6.8947 9.39316 6.85724 9.39583 6.8201C9.407 6.66468 9.50685 6.55694 9.66078 6.53471C9.69773 6.52974 9.73498 6.52736 9.77225 6.52759C9.99244 6.52696 10.2126 6.52656 10.4328 6.52788C10.4813 6.52751 10.5297 6.53185 10.5773 6.54084C10.636 6.55365 10.6893 6.58443 10.7297 6.62892C10.7701 6.6734 10.7956 6.72937 10.8027 6.78904C10.8061 6.8262 10.8072 6.86353 10.8063 6.90083C10.8064 8.0911 10.8044 9.28138 10.8075 10.4716C10.8085 10.8891 10.697 11.2673 10.4405 11.5973C10.1109 12.0215 9.67346 12.2489 9.13856 12.2894C9.08284 12.2937 9.02668 12.2934 8.97073 12.2934C6.65692 12.2936 4.34311 12.2939 2.02931 12.2944C1.60061 12.2947 1.21102 12.1831 0.873147 11.9153C0.455509 11.5842 0.23232 11.1488 0.193742 10.6183C0.189148 10.5551 0.190063 10.4915 0.190052 10.4281C0.189854 9.27887 0.189808 8.12964 0.189913 6.98041Z"
                                                    fill="#636363"
                                                />
                                                <path
                                                    d="M9.22741 2.25041C9.17238 2.24765 9.13688 2.24437 9.10138 2.24432C8.79542 2.24391 8.48924 2.2368 8.18358 2.24637C7.9378 2.25406 7.81852 2.08271 7.82583 1.8875C7.83463 1.65281 7.82708 1.41753 7.82814 1.18252C7.8292 0.950105 7.9472 0.832738 8.18105 0.832629C9.22205 0.832144 10.263 0.832158 11.304 0.832669C11.537 0.832796 11.6541 0.950766 11.6543 1.18479C11.6548 2.22559 11.6548 3.2664 11.6542 4.3072C11.6541 4.53948 11.5356 4.65675 11.3019 4.65761C11.0631 4.65849 10.8243 4.65846 10.5855 4.65753C10.3584 4.65639 10.2437 4.5405 10.2429 4.31109C10.2418 4.00892 10.2426 3.70675 10.2426 3.40458C10.2426 3.36376 10.2426 3.32294 10.2426 3.25469C10.2001 3.29176 10.173 3.31288 10.1488 3.33697C9.90839 3.57665 9.66822 3.81661 9.42833 4.05686C8.33336 5.15149 7.23912 6.24687 6.14563 7.34298C5.95487 7.53528 5.76465 7.54416 5.58321 7.34358C5.44324 7.18884 5.29435 7.04114 5.13993 6.90075C4.93406 6.71357 4.9585 6.52265 5.13639 6.34597C6.27991 5.21021 7.42039 4.07138 8.55783 2.9295C8.75308 2.73432 8.94825 2.53906 9.14335 2.34373C9.16849 2.31851 9.19115 2.29083 9.22741 2.25041Z"
                                                    fill="#636363"
                                                />
                                            </svg>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        {!props.items && (
                            <tr>
                                <td colSpan={3}>no data</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
