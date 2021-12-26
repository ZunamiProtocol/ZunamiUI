import {useRef, useState} from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';
import './PendingBalance.scss';

interface PendingBalanceProps {
    val: string;
    hint: string;
}

export const PendingBalance = (props: PendingBalanceProps): JSX.Element => {
    const target = useRef(null);
    const [show, setShow] = useState(false);

    return (
        <div className={'PendingBalance'}>
            <span className={'PendingBalance__val'}>
                <span>{props.val}</span>
            </span>
            <span
                className={'PendingBalance__hint'}
                ref={target}
                onClick={() => setShow(!show)}
            >
                <img src={'/info.svg'} alt={'Pending deposit'} />
            </span>
            <Overlay target={target.current} show={show} placement="right">
                <Tooltip>{props.hint}</Tooltip>
            </Overlay>
        </div>
    );
}
