import { useRef } from 'react';
import './WithdrawOptions.scss';
import { getBalanceNumber } from '../../../utils/formatbalance';
import BigNumber from 'bignumber.js';
import { isETH } from '../../../utils/zunami';

interface WithdrawOptionsProps {
    onCoinSelect?: Function;
    onShareSelect?: Function;
    coinsSelectionEnabled: boolean;
    sharePercent: number;
    daiChecked?: boolean;
    usdcChecked?: boolean;
    usdtChecked?: boolean;
    selectedCoin: string | undefined;
    rawBalance?: BigNumber;
    balance: BigNumber;
    lpPrice: BigNumber;
    disabled?: boolean;
    chainId?: number;
    slippage?: string;
}

export const WithdrawOptions = (props: WithdrawOptionsProps): JSX.Element => {
    const coinsGroup = useRef<HTMLInputElement>(null);
    const onCoinSelect = async (coin: string, handler: Function | undefined) => {
        if (handler) {
            handler(coin);
        }
    };

    return (
        <div className="WithdrawOptions">
            <div className="WithdrawOptions__BalanceBlock">
                <span>Your balance:</span>
                <span className="balance">{getBalanceNumber(props.balance).toFixed(3, 1)}</span>
            </div>
            <div className="WithdrawOptions__LiquidityBlock">
                <span>Share of liquidity, %</span>
                <input
                    type="text"
                    autoComplete={'off'}
                    autoCorrect={'off'}
                    pattern="[0-9]+([\.][0-9]+)?"
                    max="100"
                    maxLength={5}
                    disabled={props.daiChecked || props.usdcChecked || props.usdtChecked}
                    value={props.sharePercent}
                    onChange={(e) => {
                        const value = e.currentTarget.value;

                        if (props.onShareSelect) {
                            props.onShareSelect(value);
                        }

                        if (!isNaN(Number(value)) && Number(value) >= 100) {
                            if (props.onShareSelect) {
                                props.onShareSelect(100);
                            }
                        }
                    }}
                    onKeyUp={(e) => {
                        const value = e.currentTarget.value;

                        if (props.onShareSelect) {
                            props.onShareSelect(value);

                            if (props.onCoinSelect) {
                                props.onCoinSelect(undefined);
                            }
                        }
                    }}
                />
            </div>
            <div
                className={`WithdrawOptions__CoinsBlock ${props.disabled ? 'disabled' : ''}`}
                ref={coinsGroup}
            >
                <span>Withdraw in:</span>
                <div className="coins">
                    {isETH(props.chainId) && (
                        <label
                            className="coin"
                            onClick={() => onCoinSelect('usdc', props.onCoinSelect)}
                        >
                            <input
                                type="radio"
                                name="active-coin"
                                data-coin="usdc"
                                checked={props.selectedCoin === 'usdc'}
                                onChange={() => {}}
                            />
                            <img src="/USDC.svg" alt="" />
                            <span>USDC</span>
                        </label>
                    )}
                    {isETH(props.chainId) && (
                        <label
                            className="coin"
                            onClick={() => onCoinSelect('dai', props.onCoinSelect)}
                        >
                            <input
                                type="radio"
                                name="active-coin"
                                data-coin="dai"
                                checked={props.selectedCoin === 'dai'}
                                onChange={() => {}}
                            />
                            <img src="/DAI.svg" alt="" />
                            <span>DAI</span>
                        </label>
                    )}
                    <label
                        className="coin"
                        onClick={() => onCoinSelect('usdt', props.onCoinSelect)}
                    >
                        <input
                            type="radio"
                            name="active-coin"
                            data-coin="usdt"
                            checked={props.selectedCoin === 'usdt'}
                            onChange={() => {}}
                        />
                        <img src="/USDT.svg" alt="" />
                        <span>USDT</span>
                    </label>
                    {isETH(props.chainId) && (
                        <label
                            className="coin all-coins"
                            onClick={() => onCoinSelect('all', props.onCoinSelect)}
                        >
                            <input
                                type="radio"
                                name="active-coin"
                                data-coin="usdt"
                                checked={props.selectedCoin === 'all'}
                                onChange={() => {}}
                            />
                            <img src="/all-coins.svg" alt="" data-coin="all" />
                            <span>All coins</span>
                        </label>
                    )}
                </div>
            </div>
            {props.slippage && (
                <div className="panel Slippage">
                    <div className="panel-body">
                        <span>Slippage: </span>
                        <span
                            className={`text-${
                                Number(props.slippage) >= 0.4 ? 'danger' : 'success'
                            }`}
                        >
                            ~{props.slippage}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
