import './Pendings.scss';
import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import useWallet from '../../hooks/useWallet';

interface PendingsProps {
    deposit: string;
    withdraw: string;
}

export const Pendings: React.FC<PendingsProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    deposit,
    withdraw,
}) => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);
    const { chainId } = useWallet();
    const popover = (
        <Popover onMouseEnter={() => setShowHint(true)} onMouseLeave={() => setShowHint(false)}>
            <Popover.Body>
                {`Funds passing through the ${
                    chainId === 1
                        ? 'Transaction Streamlining Mechanism and'
                        : 'cross chain'
                } will be credited within 24 hours`}
                </Popover.Body>
        </Popover>
    );

    return (
        <div className={`Pendings ${className}`}>
            <div className="title">
                <span>Pending Deposits and Withdraws</span>
                <div
                    className={'hint'}
                    ref={target}
                    onClick={() => setShowHint(!showHint)}
                >
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="right"
                        overlay={popover}
                        show={showHint}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            onMouseEnter={() => setShowHint(true)}
                            onMouseLeave={() => setShowHint(false)}
                        >
                            <path fillRule="evenodd" clipRule="evenodd" d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM5.355 7.7464H6.49705C6.57884 7.40033 6.67637 7.15808 6.78963 7.01965C6.91548 6.86234 7.24268 6.60751 7.77122 6.25514C8.43191 5.82098 8.81573 5.3522 8.9227 4.84882C9.06742 4.23219 8.95102 3.75712 8.57348 3.42363C8.18966 3.09014 7.64852 2.9234 6.95009 2.9234C6.18243 2.9234 5.57523 3.10273 5.12848 3.46139C4.68803 3.82004 4.39229 4.3832 4.24128 5.15085H5.43995C5.54692 4.72298 5.70737 4.41466 5.92131 4.22589C6.14153 4.03713 6.44041 3.94274 6.81795 3.94274C7.49751 3.94274 7.77437 4.23848 7.64852 4.82995C7.61077 4.99984 7.52268 5.154 7.38425 5.29243C7.25211 5.43086 7.03818 5.59131 6.74244 5.77378C6.34603 6.0066 6.03457 6.27402 5.80804 6.57604C5.60669 6.83403 5.45568 7.22414 5.355 7.7464ZM4.83589 9.79452H6.21389L6.50648 8.44484H5.11904L4.83589 9.79452Z" fill="black"/>
                        </svg>
                    </OverlayTrigger>
                </div>
            </div>
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
