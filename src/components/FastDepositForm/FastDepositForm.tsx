import { useWallet } from 'use-wallet';
import './FastDepositForm.scss';
import { useState, useMemo } from 'react';
import { Input } from './Input/Input';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { DirectAction } from '../Form/DirectAction/DirectAction';
import { useAllowanceStables } from '../../hooks/useAllowance';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import { getActiveWalletName, getActiveWalletAddress } from '../WalletsModal/WalletsModal';
import { daiAddress, usdcAddress, usdtAddress } from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';

function coinNameToAddress(coinName: string): string {
    let address = daiAddress;

    switch (coinName) {
        case 'USDC':
            address = usdcAddress;
            break;
        case 'USDT':
            address = usdtAddress;
            break;
    }

    return address;
}

export const FastDepositForm = (): JSX.Element => {
    const userBalanceList = useUserBalances();
    const { account } = useWallet();

    const [optimized, setOptimized] = useState(true);
    const [pendingApproval, setPendingApproval] = useState(false);
    const [coin, setCoin] = useState('USDC');
    const [depositSum, setDepositSum] = useState('0');
    const [transactionId, setTransactionId] = useState(undefined);

    const coins = ['DAI', 'USDC', 'USDT'];
    const coinIndex = coins.indexOf(coin);

    const approveList = useAllowanceStables();
    const approvedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
    ];

    const { onApprove } = useApprove();
    const { onStake } = useStake(
        coin === 'DAI' ? depositSum : '0',
        coin === 'USDC' ? depositSum : '0',
        coin === 'USDT' ? depositSum : '0',
        !optimized
    );

    const fullBalance = useMemo(() => {
        return getFullDisplayBalance(userBalanceList[coinIndex], coin === 'DAI' ? 18 : 6);
    }, [userBalanceList, coin, coinIndex]);

    const depositEnabled =
        approvedTokens[coinIndex] &&
        Number(depositSum) > 0 &&
        !pendingApproval &&
        Number(depositSum) <= Number(fullBalance);

    return (
        <div className="FastDepositForm">
            <div className="d-flex justify-content-between">
                <span className="FastDepositForm__Title">Fast deposit</span>
                <span className="FastDepositForm__Description">Tap to Deposit & Withdraw Page</span>
            </div>
            <Input
                action="deposit"
                name={coin}
                value={depositSum}
                handler={(sum) => {
                    setDepositSum(sum);
                }}
                max={userBalanceList[coinIndex]}
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
                        {!approvedTokens[coinIndex] && (
                            <button
                                className="zun-button"
                                onClick={() => {
                                    setPendingApproval(true);

                                    try {
                                        onApprove(coinNameToAddress(coin));
                                    } catch (e) {
                                        setPendingApproval(false);
                                    }

                                    setPendingApproval(false);
                                }}
                            >
                                Approve
                            </button>
                        )}
                        {approvedTokens[coinIndex] && (
                            <button
                                className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                onClick={async () => {
                                    try {
                                        const tx = await onStake();
                                        setTransactionId(tx.transactionHash);

                                        // @ts-ignore
                                        window.dataLayer.push({
                                            event: 'deposit',
                                            userID: getActiveWalletAddress(),
                                            type: getActiveWalletName(),
                                            value: depositSum,
                                        });
                                    } catch (error: any) {
                                        debugger;
                                    }
                                }}
                            >
                                Deposit
                            </button>
                        )}
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
