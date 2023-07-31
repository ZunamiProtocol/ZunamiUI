import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { getBalanceNumber } from '../../utils/formatbalance';
import '../InfoBlock/InfoBlock.scss';
import './CoinSelector.scss';

interface CoinSelectorProps {
    // coins: Array<any>;
    name: string;
    chainId: number | undefined;
    onCoinSelect?: Function;
}

function renderCoinItem(coinName: string, onCoinSelect: Function) {
    return (
        <div className="coin-item" onClick={() => onCoinSelect(coinName)}>
            <img src={`${coinName}.svg`} alt="" />
            <div className={'coinName'}>{coinName === 'UZD' ? 'Zunami UZD' : coinName}</div>
            <div className={'coinName'}>{coinName === 'ZETH' ? 'Zunami zETH' : coinName}</div>
        </div>
    );
}

function getCoinName(name: string) {
    let result = name;

    if (name === 'UZD') {
        result = 'Zunami UZD';
    }

    if (name === 'ZETH') {
        result = 'Zunami zETH';
    }

    return result;
}

export const CoinSelector = (
    props: CoinSelectorProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    const onToggle = (e) => {
        if (props.name !== 'UZD' && props.name !== 'ZETH') {
            setIsOpen(!isOpen);
        }
    };

    const onCoinSelect = (coinName: string) => {
        if (props.onCoinSelect) {
            props.onCoinSelect(coinName);
        }
    };

    return (
        <div className="CoinSelector" onClick={onToggle}>
            <img src={`${props.name}.svg`} alt="" />
            <div className={'coinName'}>{getCoinName(props.name)}</div>
            {props.name !== 'UZD' && props.name !== 'ZETH' && (
                <svg
                    width="14"
                    height="5"
                    viewBox="0 0 14 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="selector"
                >
                    <path
                        d="M1 1L7 4L13 1"
                        stroke="#404040"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                    />
                </svg>
            )}
            {isOpen && (
                <div
                    className="Coin-Selector__Items"
                    onBlur={(e) => {
                        debugger;
                    }}
                >
                    {/* {props.chainId === 1 && renderCoinItem('DAI', onCoinSelect)}
                    {props.chainId === 1 && renderCoinItem('USDC', onCoinSelect)}
                    {props.chainId === 56 && renderCoinItem('BUSD', onCoinSelect)} */}
                    {renderCoinItem('USDT', onCoinSelect)}
                    {/* {props.chainId === 1 && renderCoinItem('FRAX', onCoinSelect)} */}
                </div>
            )}
        </div>
    );
};
