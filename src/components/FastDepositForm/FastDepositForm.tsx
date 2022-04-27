import { useWallet } from 'use-wallet';
import './FastDepositForm.scss';
import { useState } from 'react';
import { Input } from './Input/Input';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { DirectAction } from '../Form/DirectAction/DirectAction';

export const FastDepositForm = (): JSX.Element => {
    const userBalanceList = useUserBalances();
    const { account } = useWallet();
    const [optimized, setOptimized] = useState(true);
    const [coin, setCoin] = useState('USDC');
    const coins = ['DAI', 'USDC', 'USDT'];

    return (
        <div className="FastDepositForm">
            <div className="d-flex justify-content-between">
                <span className="FastDepositForm__Title">Fast deposit</span>
                <span className="FastDepositForm__Description">Tap to Deposit & Withdraw Page</span>
            </div>
            <Input
                action="deposit"
                name={coin}
                value="0"
                handler={() => {}}
                max={userBalanceList[coins.indexOf(coin)]}
                onCoinChange={(coin: string) => {
                    setCoin(coin);
                }}
            />
            <div>
                {!account && (
                    <div className="d-flex align-items-center FastDepositForm__Actions">
                        <WalletStatus />
                        <span className="FastDepositForm__Slogan">Make your first Deposit!</span>
                    </div>
                )}
                {account && (
                    <div className="d-flex align-items-center FastDepositForm__Actions">
                        <button className="zun-button">Approve</button>
                        <DirectAction
                            actionName="deposit"
                            checked={optimized}
                            disabled={false}
                            hint="When using optimized deposit funds will be deposited within 24 hours and many times cheaper"
                            onChange={(state: boolean) => {
                                setOptimized(state);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
