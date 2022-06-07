import { useRef } from 'react';
import './WithdrawOptions.scss';
import { getBalanceNumber } from '../../../utils/formatbalance';
import BigNumber from 'bignumber.js';

interface WithdrawOptionsProps extends React.HTMLProps<HTMLDivElement> {
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
    lpPrice?: BigNumber;
}

export const coinSelectHandler = async (coin: string, handler: Function | undefined) => {
    if (handler) {
        handler(coin);
    }
};

export const WithdrawOptions: React.FC<WithdrawOptionsProps> = ({
    balance,
    lpPrice,
    onShareSelect,
    onCoinSelect,
    daiChecked,
    usdcChecked,
    usdtChecked,
    sharePercent,
    selectedCoin,
    coinsSelectionEnabled,
    ...props
}) => {
    const coinsGroup = useRef<HTMLInputElement>(null);

    const classNames = ['WithdrawOptions', props.className].join(' ');

    return (
        <div className={classNames} {...props}>
            <div className="WithdrawOptions__BalanceBlock">
                <span>Your balance:</span>
                <span className="balance">{getBalanceNumber(balance).toFixed(3, 1)}</span>
                {lpPrice && <span> (LP price: {lpPrice.toFixed(2, 1)})</span>}
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
                    disabled={daiChecked || usdcChecked || usdtChecked}
                    value={sharePercent}
                    onChange={(e) => {
                        const value = e.currentTarget.value;

                        if (onShareSelect) {
                            onShareSelect(value);
                        }

                        if (!isNaN(Number(value)) && Number(value) >= 100) {
                            if (onShareSelect) {
                                onShareSelect(100);
                            }
                        }
                    }}
                    onKeyUp={(e) => {
                        const value = e.currentTarget.value;

                        if (onShareSelect) {
                            onShareSelect(value);

                            if (onCoinSelect) {
                                onCoinSelect(undefined);
                            }
                        }
                    }}
                />
            </div>
            <div className="WithdrawOptions__CoinsBlock" ref={coinsGroup}>
                <span>Withdraw in:</span>
                <div className="coins">
                    <label className="coin" onClick={() => coinSelectHandler('usdc', onCoinSelect)}>
                        <input
                            type="radio"
                            name="active-coin"
                            data-coin="usdc"
                            checked={selectedCoin === 'usdc'}
                            onChange={() => {}}
                        />
                        <img src="/USDC.svg" alt="" />
                        <span>USDC</span>
                    </label>
                    <label className="coin" onClick={() => coinSelectHandler('dai', onCoinSelect)}>
                        <input
                            type="radio"
                            name="active-coin"
                            data-coin="dai"
                            checked={selectedCoin === 'dai'}
                            onChange={() => {}}
                        />
                        <img src="/DAI.svg" alt="" />
                        <span>DAI</span>
                    </label>
                    <label className="coin" onClick={() => coinSelectHandler('usdt', onCoinSelect)}>
                        <input
                            type="radio"
                            name="active-coin"
                            data-coin="usdt"
                            checked={selectedCoin === 'usdt'}
                            onChange={() => {}}
                        />
                        <img src="/USDT.svg" alt="" />
                        <span>USDT</span>
                    </label>
                    <label
                        className="coin all-coins"
                        onClick={() => coinSelectHandler('all', onCoinSelect)}
                    >
                        <input
                            type="radio"
                            name="active-coin"
                            data-coin="usdt"
                            checked={selectedCoin === 'all'}
                            onChange={() => {}}
                        />
                        <img src="/all-coins.svg" alt="" data-coin="all" />
                        <span>All coins</span>
                    </label>
                </div>
            </div>
        </div>
    );
};
