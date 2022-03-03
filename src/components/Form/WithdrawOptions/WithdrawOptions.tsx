import { useState } from 'react';
import './WithdrawOptions.scss';

interface WithdrawOptionsProps {}

export const WithdrawOptions = (props: WithdrawOptionsProps): JSX.Element => {
    const [liquidity, setLiquidity] = useState(100);

    return (
        <div className="WithdrawOptions">
            <div className="WithdrawOptions__BalanceBlock">
                <span>Your balance:</span>
                <span className="balance">$100 000</span>
            </div>
            <div className="WithdrawOptions__LiquidityBlock">
                <span>Share of liquidity, %</span>
                <input
                    type="text"
                    inputMode={'decimal'}
                    autoComplete={'off'}
                    autoCorrect={'off'}
                    pattern={'^[0-9]*[.,]?[0-9]*$'}
                    placeholder={'0.00'}
                    min={0}
                    minLength={1}
                    maxLength={79}
                    value={liquidity}
                    onChange={(e) => {
                        setLiquidity(Number(e.currentTarget.value));
                    }}
                />
            </div>
            <div className="WithdrawOptions__CoinsBlock">
                <span>Withdraw, % in:</span>
                <div className="coins">
                    <label className="coin all-coins">
                        <input type="checkbox" />
                        <img src="/all-coins.png" alt="" />
                        <span>All coins</span>
                    </label>
                    <label className="coin">
                        <input type="checkbox" />
                        <img src="/USDC.svg" alt="" />
                        <span>USDC</span>
                    </label>
                    <label className="coin">
                        <input type="checkbox" />
                        <img src="/DAI.svg" alt="" />
                        <span>DAI</span>
                    </label>
                    <label className="coin">
                        <input type="checkbox" />
                        <img src="/USDT.svg" alt="" />
                        <span>USDT</span>
                    </label>
                </div>
            </div>
        </div>
    );
};
