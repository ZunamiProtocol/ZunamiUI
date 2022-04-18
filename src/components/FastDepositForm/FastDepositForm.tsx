import { BigNumber } from 'bignumber.js';
import { useWallet } from 'use-wallet';
import './FastDepositForm.scss';
import { Input } from '../Form/Input/Input';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { DirectAction } from '../Form/DirectAction/DirectAction';

export const FastDepositForm = (): JSX.Element => {
    const userBalanceList = useUserBalances();
    const { account, reset } = useWallet();

    return (
        <div className="FastDepositForm">
            <div className="d-flex justify-content-between">
                <span className="FastDepositForm__Title">Fast deposit</span>
                <span className="FastDepositForm__Description">Tap to Deposit & Withdraw Page</span>
            </div>
            <Input
                action="deposit"
                name="qwe"
                value="0"
                handler={() => {}}
                max={userBalanceList[2]}
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
                            checked={false}
                            disabled={false}
                            hint="When using optimized deposit funds will be deposited within 24 hours and many times cheaper"
                            onChange={(state: boolean) => {
                                // if (props.onOperationModeChange) {
                                //     props.onOperationModeChange(state);
                                // }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
