import './Pendings.scss';

interface PendingsProps {
    deposit: string;
    withdraw: string;
}

export const Pendings: React.FC<PendingsProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    deposit,
    withdraw,
}) => {
    return (
        <div className={`Pendings ${className}`}>
            <div className="title">Pending Deposits and Withdraws</div>
            <div className="values">
                <div className="deposit">
                    <div className="title">Deposits</div>
                    <div className="value">{deposit}</div>
                </div>
                <div className="withdraw">
                    <div className="title">Withdrawals</div>
                    <div className="value">{withdraw}</div>
                </div>
            </div>
        </div>
    );
};
