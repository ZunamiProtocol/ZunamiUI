import { useState, useRef } from 'react';
import '../InfoBlock/InfoBlock.scss';
import './CoinSelector.scss';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ReactComponent as HintIcon } from '../../assets/info.svg';

interface CoinSelectorProps {
    mode: string;
    name: string;
    chainId: number | undefined;
    onCoinSelect?: Function;
    hideToggler?: boolean;
}

interface CoinProps {
    coinName: string;
    onCoinSelect: Function;
}

function displayCoinName(coinCode: string) {
    let result = coinCode;

    switch (coinCode) {
        case 'UZD':
            result = 'zunUSD';
            break;
    }

    return result;
}

function renderCoinItem(props: CoinProps & React.HTMLProps<HTMLButtonElement>) {
    return (
        <div
            className={`coin-item ${props.className}`}
            onClick={() => props.onCoinSelect(props.coinName)}
        >
            <img src={`${props.coinName.toLowerCase()}.svg`} alt="" />
            <div className={'coinName'}>{displayCoinName(props.coinName)}</div>
        </div>
    );
}

function getCoinName(name: string, mode: string) {
    let result = name;

    if (name === 'UZD') {
        result = 'zunUSD';
    }

    if (name === 'ZETH') {
        result = 'zunETH';
    }

    if (name === 'ethZAPSLP') {
        result = 'zunUSD';
    }

    if (name === 'ZAPSLP') {
        result = 'zunUSD';
    }

    return result;
}

export const CoinSelector = (
    props: CoinSelectorProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    const onToggle = () => {
        // const disabledCoins = ['UZD', 'ZETH', 'ethZAPSLP'];
        // if (disabledCoins.indexOf(props.name) !== -1) {
        setIsOpen(!isOpen);
        // }
    };

    const onCoinSelect = (coinName: string) => {
        if (props.onCoinSelect) {
            props.onCoinSelect(coinName);
        }
    };

    return (
        <div className="CoinSelector" onClick={onToggle}>
            <img src={`${props.name.toLowerCase()}.svg`} alt="" />
            <div className={'coinName'}>{getCoinName(props.name, props.mode)}</div>
            {props.mode === 'deposit' && !props.hideToggler && (
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
            {isOpen && props.mode === 'deposit' && (
                <div className="Coin-Selector__Items big">
                    <div className="row">
                        <div className="col-xs-12 col-md-6">
                            <div className="h-100 d-flex flex-column">
                                <div className="title">Native</div>
                                <div className="flex-grow-1 d-flex align-items-center">
                                    {renderCoinItem({
                                        coinName: 'UZD',
                                        onCoinSelect,
                                        className: 'mt-4',
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-md-6">
                            <div className="d-flex gap-1 align-items-center mt-4 mt-md-0">
                                <span className="title me-1">ZAP (Swap + Deposit)</span>
                                <div ref={target} onClick={() => setShowHint(!showHint)}>
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={<Tooltip>QWEQWEQWE</Tooltip>}
                                    >
                                        <HintIcon />
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className="row mt-3 mt-md-2">
                                <div className="col-6">
                                    {renderCoinItem({
                                        coinName: 'USDC',
                                        onCoinSelect,
                                        className: 'mt-2 mb-3',
                                    })}
                                    {renderCoinItem({ coinName: 'DAI', onCoinSelect })}
                                </div>
                                <div className="col-6">
                                    {renderCoinItem({
                                        coinName: 'USDT',
                                        onCoinSelect,
                                        className: 'mt-2 mb-3',
                                    })}
                                    {renderCoinItem({ coinName: 'FRAX', onCoinSelect })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
