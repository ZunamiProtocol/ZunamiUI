import './FastDepositForm.scss';
import { useState, useMemo, useEffect } from 'react';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances, coins, getCoinAddressByIndex } from '../../hooks/useUserBalances';
import { useAllowanceStables, useAllowance } from '../../hooks/useAllowance';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { getActiveWalletName } from '../WalletsModal/WalletsModal';
import { BIG_ZERO, NULL_ADDRESS } from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { log } from '../../utils/logger';
import { isETH, isSEP } from '../../utils/zunami';
import { ActionSelector } from '../Form/ActionSelector/ActionSelector';
import { DirectAction } from '../Form/DirectAction/DirectAction';
import { useAccount, useNetwork, Address, sepolia } from 'wagmi';
import { ReactComponent as StakingUzdLogo } from './assets/zun-usd-logo.svg';
import { ReactComponent as StakingZethLogo } from './assets/zun-eth-logo.svg';
import { ReactComponent as MobileToggleIcon } from './assets/mobile-toggle-icon.svg';
import { renderToasts, FastDepositFormProps } from './types';
import { zunUsdSepoliaAddress, zunUsdApsSepoliaAddress } from '../../sushi/lib/constants';
import useApprove from '../../hooks/useApprove';
import { APPROVE_SUM } from '../../sushi/utils';

export const FastDepositForm: React.FC<FastDepositFormProps & React.HTMLProps<HTMLDivElement>> = ({
    stakingMode,
    className,
}) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();
    const userBalanceList = useUserBalances(account, chainId);

    const [lockAndBoost, setLockAndBoost] = useState(true);
    const [action, setAction] = useState('deposit');
    const [depositSum, setDepositSum] = useState('0');
    const [withdrawSum, setWithdrawSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [coinIndex, setCoinIndex] = useState(4);

    // Current APS contract address
    const contractAddress: Address = zunUsdApsSepoliaAddress;
    const zunUsdAddress: Address = zunUsdSepoliaAddress;

    // deposit allowance
    const allowance = useAllowanceStables(account, contractAddress, chainId);
    // withdraw allowance
    const withdrawAllowance = useAllowance(zunUsdSepoliaAddress, account, contractAddress, chainId);

    // APS balance
    const apsBalance = BIG_ZERO;
    // ZETH APS balance
    const zethApsBalance = BIG_ZERO;

    // set withdraw sum to maximum
    useEffect(() => {
        if (action === 'withdraw') {
            const withdrawMaxBalance =
                stakingMode === 'UZD' ? userBalanceList[4] : userBalanceList[5];
            setWithdrawSum(getFullDisplayBalance(withdrawMaxBalance));
        }
    }, [stakingMode, action, userBalanceList]);

    useEffect(() => {
        let preselectedCoin = stakingMode === 'UZD' ? 'zunUSD' : 'zunETH';

        if (action === 'withdraw' && stakingMode === 'ZETH') {
            preselectedCoin = 'ethZAPSLP';
        }

        if (action === 'withdraw') {
            preselectedCoin = 'zunUSD';
        }

        if (action === 'claim') {
            preselectedCoin = 'ZUN';
        }

        setCoinIndex(coins.indexOf(preselectedCoin));
    }, [stakingMode, action]);

    // get user max balance
    const fullBalance = useMemo(() => {
        let decimalPlaces = 18;
        let digits = 18;

        if (userBalanceList[coinIndex] && !userBalanceList[coinIndex].toNumber()) {
            decimalPlaces = 0;
        }

        if (!userBalanceList[coinIndex].toNumber()) {
            return '0';
        }

        if (chainId === sepolia.id) {
            const isDaiOrFrax = coinIndex === 0 || coinIndex === 5;
            // decimalPlaces = isDaiOrFrax ? 18 : 6;
            decimalPlaces = 18;
        }

        if (!userBalanceList[coinIndex].toNumber()) {
            digits = 0;
        }

        if (coinIndex === 0) {
            // zunUSD
            return getFullDisplayBalance(userBalanceList[coinIndex], decimalPlaces, digits);
        } else if (coinIndex === 1) {
            // zunETH
            return getFullDisplayBalance(userBalanceList[coinIndex], decimalPlaces, digits);
        }

        return getFullDisplayBalance(userBalanceList[coinIndex], decimalPlaces);
    }, [userBalanceList, coinIndex, chainId]);

    // selected coin approved
    const coinApproved = useMemo(() => {
        if (action === 'deposit') {
            return allowance[coinIndex].toNumber() > 0;
        } else {
            return withdrawAllowance.toNumber() > 0;
            // return allowance[coinIndex].toNumber() > 0;
        }
    }, [allowance, coinIndex, action, withdrawAllowance]);

    // show approve btn or not
    const showApproveBtn = useMemo(() => {
        let result = !coinApproved;

        if (action === 'claim') {
            return false;
        }

        return result;
    }, [coinApproved, action]);

    const approveEnabled = useMemo(() => {
        let result = true;

        if (action === 'deposit' && !Number(depositSum)) {
            return false;
        }

        if (action === 'withdraw' && !Number(withdrawSum)) {
            return false;
        }

        return result;
    }, [action, withdrawSum, depositSum]);

    const depositEnabled = useMemo(() => {
        let result =
            coinApproved && Number(depositSum) > 0 && Number(depositSum) <= Number(fullBalance);

        return result;
    }, [coinApproved, depositSum, fullBalance]);

    const withdrawEnabled = useMemo(() => {
        let result = true;

        if (!account || account === NULL_ADDRESS) {
            return false;
        }

        if (!Number(withdrawSum)) {
            result = false;
        }

        return result;
    }, [withdrawSum, account]);

    const depositValidationError = useMemo(() => {
        let message = '';

        if (Number(depositSum) >= Number(fullBalance)) {
            message = "You're trying to deposit more than you have";
        }

        if (Number(depositSum) === 0) {
            message = 'Please, enter a value more than a zero';
        }

        return message;
    }, [depositSum, fullBalance]);

    // set default input to max
    useEffect(() => {
        if (!fullBalance) {
            return;
        }

        setDepositSum(fullBalance.toString());
    }, [fullBalance]);

    // max input sum update
    const maxInputSum = useMemo(() => {
        let result = BIG_ZERO;

        if (!isETH(chainId) && !isSEP(chainId)) {
            return BIG_ZERO;
        }

        if (stakingMode === 'UZD') {
            if (action === 'deposit') {
                result = userBalanceList[coinIndex];
            } else {
                result = userBalanceList[4];
            }
        }

        if (stakingMode === 'ZETH') {
            if (action === 'deposit') {
                result = userBalanceList[coinIndex];
            } else {
                result = userBalanceList[5];
            }
        }

        return result;
    }, [action, stakingMode, coinIndex, userBalanceList, chainId]);

    // deposit
    const { deposit } = useStake(coinIndex, depositSum, account || NULL_ADDRESS);
    // withdraw
    const { withdraw } = useUnstake(
        withdrawSum,
        ['0', '0', '0', '0', '0'],
        account || NULL_ADDRESS
    );

    // spender for approve
    const addressForApprove = useMemo(() => {
        if (action === 'deposit') {
            return getCoinAddressByIndex(coinIndex, chainId ?? 1);
        } else {
            return zunUsdSepoliaAddress;
        }
    }, [action, chainId, coinIndex]);

    // approve
    const {
        data: approveResult,
        isLoading: isApproving,
        isSuccess: approveSuccessful,
        write: approve,
    } = useApprove(addressForApprove, contractAddress, APPROVE_SUM);

    return (
        <div className={`FastDepositForm ${className} mode-${stakingMode}`}>
            {renderToasts(
                transactionError,
                setTransactionError,
                chainId ?? 1,
                transactionId,
                setTransactionId
            )}
            <div className="d-flex justify-content-between align-items-center">
                <span className="FastDepositForm__Title">
                    <div className="">
                        <ActionSelector
                            value={action}
                            actions={[
                                {
                                    name: 'deposit',
                                    title: 'Deposit',
                                },
                                {
                                    name: 'withdraw',
                                    title: 'Withdraw',
                                },
                                // {
                                //     name: 'claim',
                                //     title: 'Claim',
                                //     disabled: true,
                                // },
                            ]}
                            onChange={(action: string) => {
                                setAction(action);
                            }}
                        />
                    </div>
                </span>
                <div className="FastDepositForm__Description">
                    {stakingMode === 'UZD' && <StakingUzdLogo />}
                    {stakingMode === 'ZETH' && <StakingZethLogo />}
                </div>
            </div>
            <div className="FastDepositForm__MobileToggle">
                <MobileToggleIcon />
                <div className="FastDepositForm__MobileToggle__Title">
                    <ActionSelector
                        value={action}
                        actions={[
                            {
                                name: 'deposit',
                                title: 'Deposit',
                            },
                            {
                                name: 'withdraw',
                                title: 'Withdraw',
                            },
                            // {
                            //     name: 'claim',
                            //     title: 'Claim',
                            //     disabled: true,
                            // },
                        ]}
                        onChange={(action: string) => {
                            setAction(action);
                        }}
                    />
                </div>
            </div>
            <Input
                action="deposit"
                name={coins[coinIndex]}
                mode={action}
                stakingMode={stakingMode}
                value={action === 'deposit' ? depositSum : withdrawSum}
                handler={(sum) => {
                    if (action === 'deposit') {
                        setDepositSum(sum);
                        console.log(`Deposit sum set to ${sum}`);
                    } else {
                        setWithdrawSum(sum);
                        console.log(`Withdraw sum set to ${sum}`);
                    }
                }}
                max={maxInputSum}
                onCoinChange={(coin: string) => {
                    setCoinIndex(coins.indexOf(coin));
                }}
                chainId={chainId}
                className=""
            />
            <div>
                <div>
                    <div className="">
                        <div className="buttons">
                            {action === 'withdraw' && coinApproved && (
                                <button
                                    id="withdraw-btn"
                                    className={`zun-button ${withdrawEnabled ? '' : 'disabled'}`}
                                    onClick={async () => {
                                        setPendingTx(true);

                                        try {
                                            if (stakingMode === 'UZD') {
                                                const txHash: string = await withdraw();
                                                setTransactionId(txHash);
                                            }
                                        } catch (error: any) {
                                            setTransactionError(true);
                                            log(`❗️ Error while withdrawing: ${error.message}`);
                                        }

                                        setPendingTx(false);
                                    }}
                                >
                                    Withdraw
                                </button>
                            )}
                            {showApproveBtn && (
                                <button
                                    id="approve-btn"
                                    disabled={!approveEnabled}
                                    className={`zun-button approve-usd`}
                                    onClick={() => {
                                        setPendingTx(true);
                                        if (approve) {
                                            approve();
                                        }
                                        setPendingTx(false);
                                    }}
                                >
                                    Approve
                                </button>
                            )}
                            {action === 'deposit' && coinApproved && (
                                <button
                                    id="deposit-btn"
                                    className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                    onClick={async () => {
                                        // if (deposit) {
                                        setPendingTx(true);
                                        try {
                                            const tx = await deposit();
                                            log(`Deposit executed. Tx ID: ${tx}`);
                                            setTransactionId(tx);
                                            setDepositSum('0');
                                            log('Deposit success');
                                            log(JSON.stringify(`Transaction ID: ${tx}`));

                                            // @ts-ignore
                                            if (window.dataLayer) {
                                                // @ts-ignore
                                                window.dataLayer.push({
                                                    event: 'deposit',
                                                    userID: account,
                                                    type: getActiveWalletName(),
                                                    value: depositSum,
                                                });
                                            }
                                        } catch (error: any) {
                                            setPendingTx(false);
                                            setTransactionError(true);
                                            log(`❗️ Deposit error: ${error.message}`);
                                            log(JSON.stringify(error));
                                        }
                                        setPendingTx(false);

                                        // }
                                    }}
                                >
                                    Deposit
                                </button>
                            )}
                            {action === 'deposit' && coinApproved && !depositEnabled && (
                                <div className="text-muted text-danger ms-3 d-flex align-items-center">
                                    {depositValidationError}
                                </div>
                            )}
                            {action === 'claim' && <button className={`zun-button`}>Claim</button>}
                            {isApproving && <Preloader className="ms-2" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
