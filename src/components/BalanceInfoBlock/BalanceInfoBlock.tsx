import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { getBalanceNumber } from '../../utils/formatbalance';
import '../InfoBlock/InfoBlock.scss';
import './BalanceInfoBlock.scss';
import { copyLogs } from '../../utils/logger';

interface Balance {
    chainId: String;
    value: BigNumber;
}

interface InfoBlockProps {
    iconName?: string;
    title: string;
    description?: string | JSX.Element;
    withColor: boolean;
    isStrategy: boolean;
    isLoading?: boolean;
    secondaryRow?: JSX.Element | undefined;
    hint?: JSX.Element;
    colorfulBg?: boolean;
    icon?: JSX.Element | undefined;
    balances: Array<Balance>;
    lpPrice: BigNumber;
}

function renderBalances(balances: Array<Balance>, lpPrice: BigNumber) {
    return (
        <div className="BalanceInfoBlock__Balances">
            {balances.map((balance) => (
                <div className="balance" key={balance.chainId}>
                    <div className="chain">{balance.chainId}</div>
                    <div className="sum">
                        {`$ ${getBalanceNumber(balance.value.multipliedBy(lpPrice))
                            .toNumber()
                            .toLocaleString('en')}`}
                    </div>
                </div>
            ))}
        </div>
    );
}

export const BalanceInfoBlock = (
    props: InfoBlockProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);
    const [clickCounter, setClickCounter] = useState(0);

    const popover = (
        <Popover onMouseEnter={() => setShowHint(true)} onMouseLeave={() => setShowHint(false)}>
            <Popover.Body>{renderBalances(props.balances, props.lpPrice)}</Popover.Body>
        </Popover>
    );

    return (
        <div
            className={`InfoBlock BalanceInfoBlock ${
                props.isStrategy === true ? 'InfoBlock_long' : ''
            }
            ${props.colorfulBg === true ? 'InfoBlock_colorful' : ''}
            ${props.secondaryRow ? 'InfoBlock_secondaryRow' : ''}
        `}
            data-title={props.title}
            onClick={() => {
                setClickCounter(clickCounter + 1);

                if (clickCounter === 4) {
                    copyLogs();
                    setClickCounter(0);
                }
            }}
        >
            <div className={`InfoBlock__title ${props.hint ? 'with_hint' : ''}`}>
                {!props.isLoading && props.icon && props.icon}
                <span>{props.title}</span>
            </div>
            {props.isLoading && <div className={'preloader mt-3'}></div>}
            {!props.isLoading && (
                <div
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}
                >
                    <div>{props.description}</div>
                </div>
            )}
            {!props.isLoading && props.secondaryRow && props.secondaryRow}
            <div className="BalanceInfoBlock__AllBalances">
                <span>Another balances</span>
                <div
                    className="BalanceInfoBlock__AllBalances__Icon"
                    ref={target}
                    onMouseEnter={() => setShowHint(true)}
                    onMouseLeave={() => setShowHint(false)}
                >
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="bottom"
                        overlay={popover}
                        show={showHint}
                    >
                        <svg
                            width="9"
                            height="8"
                            viewBox="0 0 9 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            onMouseEnter={() => setShowHint(true)}
                        >
                            <path
                                d="M6.23205 1C5.46225 -0.333333 3.53775 -0.333333 2.76795 1L0.602885 4.75C-0.166915 6.08333 0.795335 7.75 2.33494 7.75H6.66506C8.20466 7.75 9.16691 6.08333 8.39711 4.75L6.23205 1Z"
                                fill="#B4B4B4"
                            />
                        </svg>
                    </OverlayTrigger>
                </div>
            </div>
        </div>
    );
};
