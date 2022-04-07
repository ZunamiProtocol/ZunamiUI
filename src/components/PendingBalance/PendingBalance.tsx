import './PendingBalance.scss';
import { ReactComponent as PendingIcon } from './pending-icon.svg';

interface PendingBalanceProps {
    val: string;
    hint: string;
}

export const PendingBalance = (props: PendingBalanceProps): JSX.Element => {
    return (
        <div className={'PendingBalance'}>
            <PendingIcon className="PendingBalance__icon" />
            <div className={'PendingBalance__val'}>{props.val}</div>
        </div>
    );
};
