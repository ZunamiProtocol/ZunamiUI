import { format } from 'date-fns';
import './HistoryTable.scss';

interface TableItem {
    value: number;
    canUnlock: boolean;
    lockDate: number;
    unlockDate: number;
}

interface HistoryTableProps {
    data: Array<TableItem>;
}

export const HistoryTable = (props: HistoryTableProps): JSX.Element => {
    return (
        <table className="StakingHistoryTable">
            <thead>
                <tr>
                    <td>Amount staked</td>
                    <td>Lock date</td>
                    <td>Unlock date</td>
                    <td>Actions</td>
                </tr>
            </thead>
            <tbody>
                {props.data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.value.toLocaleString()} ZUN</td>
                        <td>{format(item.lockDate * 1000, 'MMM d, yyyy, h:m:aaa')}</td>
                        <td>{format(item.unlockDate * 1000, 'MMM d, yyyy, h:m:aaa')}</td>
                        <td>
                            <button className={`unlock ${!item.canUnlock ? 'disabled' : ''}`}>
                                Unlock
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
