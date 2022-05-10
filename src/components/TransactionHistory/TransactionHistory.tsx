import './TransactionHistory.scss';

interface TransactionHistoryProps {
    title: any;
    items?: Array<any>;
}

export const TransactionHistory = (props: TransactionHistoryProps): JSX.Element => {
    return (
        <div className={'TransactionHistory'}>
            <div className="TransactionHistory__Title">{props.title}</div>
            <table className="TransactionHistory__List">
                <thead>
                    <tr>
                        <th>Coin</th>
                        <th>Value</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {props.items &&
                        props.items.map((item) => (
                            <tr>
                                <td>qwe</td>
                                <td>qwe</td>
                                <td>qwe</td>
                                <td>qwe</td>
                            </tr>
                        ))}
                    {(!props.items || props.items.length) && (
                        <tr>
                            <td colSpan={3}>no data</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
