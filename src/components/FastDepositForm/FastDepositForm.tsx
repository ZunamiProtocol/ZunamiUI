import './FastDepositForm.scss';
import { useState, useMemo, useEffect } from 'react';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances, coins, getCoinAddressByIndex } from '../../hooks/useUserBalances';
import {
    useAllowanceStables,
    useAllowance,
    getTokenAddressByIndex,
} from '../../hooks/useAllowance';
import useStake from '../../hooks/useStake';
import useUnstake from '../../hooks/useUnstake';
import { getActiveWalletName } from '../WalletsModal/WalletsModal';
import { BIG_ZERO, NULL_ADDRESS, getDecimalsByTokenIndex } from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { log } from '../../utils/logger';
import {
    getZapAddress,
    getZunEthApsAddress,
    getZunUsdApsAddress,
    isETH,
    isSEP,
} from '../../utils/zunami';
import { ActionSelector } from '../Form/ActionSelector/ActionSelector';
import { useAccount, useNetwork, Address, sepolia } from 'wagmi';
import { ReactComponent as StakingUzdLogo } from './assets/zun-usd-logo.svg';
import { ReactComponent as StakingZethLogo } from './assets/zun-eth-logo.svg';
import { ReactComponent as MobileToggleIcon } from './assets/mobile-toggle-icon.svg';
import { renderToasts, FastDepositFormProps } from './types';
import useApprove from '../../hooks/useApprove';
import { APPROVE_SUM } from '../../sushi/utils';
import useBalanceOf from '../../hooks/useBalanceOf';
import { waitForTransaction } from '@wagmi/core';
import BigNumber from 'bignumber.js';

export const FastDepositForm: React.FC<FastDepositFormProps & React.HTMLProps<HTMLDivElement>> = ({
    stakingMode,
    className,
}) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();
    // const account = '0xF9605D8c4c987d7Cb32D0d11FbCb8EeeB1B22D5d';
    const userBalanceList = useUserBalances(account, chainId);
    const [action, setAction] = useState('deposit');
    const [depositSum, setDepositSum] = useState('0');
    const [withdrawSum, setWithdrawSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);

    // selected coin index (0 - DAI, 1 - USDC, 2 - USDT, 3 - FRAX, 4 - zunUSD, 5 - zunETH)
    const [coinIndex, setCoinIndex] = useState(2);

    // If zunUSD/zunETH, then main contract is APS, else ZAP
    const contractAddress: Address = useMemo(() => {
        let result = getZapAddress(chainId, stakingMode);

        if (coinIndex === 4) {
            return getZunUsdApsAddress(chainId);
        }

        if (coinIndex === 5) {
            return getZunEthApsAddress(chainId);
        }

        return result;
    }, [chainId, coinIndex, stakingMode]);

    // deposit allowance. Check whether it's required to make approve
    const allowance = useAllowanceStables(account, contractAddress, chainId);

    // selected coin address
    const selectedCoinAddress = useMemo(() => {
        return getTokenAddressByIndex(coinIndex, chainId ? chainId : 1);
    }, [coinIndex, chainId]);

    // withdraw allowance
    const withdrawAllowance = useAllowance(selectedCoinAddress, account, contractAddress, chainId);
    log(`[APS] Withdraw allowance: ${withdrawAllowance} (${selectedCoinAddress})`);

    // APS balance
    const apsBalance = useBalanceOf(getZunUsdApsAddress(chainId));
    const apsEthBalance = useBalanceOf(getZunEthApsAddress(chainId));

    log(`[APS] Balance ${apsBalance.toFixed()}`);

    useEffect(() => {
        let preselectedCoin = stakingMode === 'UZD' ? 'USDT' : 'zunETH';

        if (action === 'withdraw' && stakingMode === 'ZETH') {
            preselectedCoin = 'apsZunETHLP';
        }

        if (action === 'withdraw') {
            preselectedCoin = 'zunUSD';

            if (action === 'withdraw') {
                preselectedCoin = 'apsZunUSDLP';
            }
        }

        setCoinIndex(coins.indexOf(preselectedCoin));
    }, [stakingMode, action]);

    // get user max balance
    const fullBalance = useMemo(() => {
        let decimalPlaces = 18;
        let digits = 6;

        if (action === 'withdraw') {
            if (chainId === sepolia.id) {
                digits = 6;
            }

            let result = getFullDisplayBalance(apsBalance, decimalPlaces, digits);
            log(`[APS] Max withdraw sum is ${result} (${digits})`);
            return result;
        }

        if (!userBalanceList[coinIndex].toNumber()) {
            decimalPlaces = 0;
        }

        if (coinIndex === 0 || coinIndex === 4) {
            digits = 18;
        }

        let result = getFullDisplayBalance(userBalanceList[coinIndex], digits, decimalPlaces);
        log(`[APS] Max deposit sum is ${result}`);

        return result;
    }, [userBalanceList, coinIndex, action, apsBalance, chainId]);

    // selected coin approved
    const coinApproved = useMemo(() => {
        let result = false;

        if (action === 'deposit') {
            // APS deposit
            result =
                allowance[coinIndex].toNumber() >=
                new BigNumber(depositSum).times(getDecimalsByTokenIndex(coinIndex)).toNumber();
        } else {
            result = withdrawAllowance.toNumber() > 0;
        }

        log(`[APS] Coin approved: ${result}`);
        return result;
    }, [allowance, coinIndex, action, withdrawAllowance, depositSum]);

    // show approve btn or not
    const showApproveBtn = useMemo(() => {
        let result = !coinApproved;

        if (action === 'withdraw') {
            result = false;
        }

        return result;
    }, [coinApproved, action]);

    log(`[APS] Approve button visible: ${showApproveBtn}`);

    const approveEnabled = useMemo(() => {
        let result = true;

        // something already in progress
        if (pendingTx) {
            return false;
        }

        if (action === 'deposit' && !Number(depositSum)) {
            return false;
        }

        if (action === 'withdraw' && !Number(withdrawSum)) {
            return false;
        }

        return result;
    }, [action, withdrawSum, depositSum, pendingTx]);

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

        if (Number(depositSum) > Number(fullBalance)) {
            console.log(depositSum, fullBalance);
            log(`Input val: ${Number(depositSum)} vs raw val: ${Number(fullBalance)}`);
            message = "You're trying to deposit more than you have";
        }

        if (Number(depositSum) === 0) {
            message = 'Please, enter a value';
        }

        return message;
    }, [depositSum, fullBalance]);

    // set default input to max
    useEffect(() => {
        if (!fullBalance) {
            return;
        }

        // console.log(fullBalance);

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
                result = apsBalance;
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
    }, [action, stakingMode, coinIndex, userBalanceList, chainId, apsBalance]);

    // deposit
    const { deposit } = useStake(coinIndex, depositSum, account || NULL_ADDRESS, stakingMode);
    // withdraw
    const { withdraw } = useUnstake(
        withdrawSum,
        ['0', '0', '0', '0', '0'],
        account || NULL_ADDRESS
    );

    // target for approve (which coin we ask for allowance)
    const addressForApprove = useMemo(() => {
        if (action === 'deposit') {
            return getCoinAddressByIndex(coinIndex, chainId ?? 1);
            // }
        } else {
            return getZunUsdApsAddress(chainId);
        }
    }, [action, chainId, coinIndex]);

    // spender for approve
    const approveSpender = useMemo(() => {
        return contractAddress;
    }, [contractAddress]);

    // approve
    const {
        data: approveResult,
        isLoading: isApproving,
        // isSuccess: approveSuccessful,
        write: approve,
    } = useApprove(addressForApprove, approveSpender, APPROVE_SUM, chainId);

    // if (approveResult) {
    //     console.log(approveResult);
    // }

    // wait for approve, then unblock button
    useEffect(() => {
        if (approveResult) {
            setPendingTx(true);

            waitForTransaction({
                hash: approveResult?.hash,
            }).then(() => {
                setPendingTx(false);
            });
        }
    }, [approveResult]);

    const coinName = useMemo(() => {
        if (action === 'withdraw' && coinIndex === 4) {
            return 'apsZunUSDLP';
        }

        if (action === 'withdraw' && coinIndex === 5) {
            return 'apsZunETHLP';
        }

        return coins[coinIndex];
    }, [coinIndex, action]);

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
                action={action}
                name={coinName}
                mode={action}
                stakingMode={stakingMode}
                value={action === 'deposit' ? depositSum : withdrawSum}
                handler={(sum) => {
                    if (action === 'deposit') {
                        setDepositSum(sum);
                        log(`Deposit sum set to ${sum}`);
                    } else {
                        setWithdrawSum(sum);
                        log(`Withdraw sum set to ${sum}`);
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
                            {action === 'withdraw' && (
                                <button
                                    id="withdraw-btn"
                                    className={`zun-button ${withdrawEnabled ? '' : 'disabled'}`}
                                    onClick={async () => {
                                        setPendingTx(true);

                                        try {
                                            if (stakingMode === 'UZD') {
                                                const txHash = await withdraw();
                                                setTransactionId(txHash);
                                                setWithdrawSum('');

                                                waitForTransaction({ hash: txHash }).then(() => {
                                                    setPendingTx(false);
                                                });
                                            }
                                        } catch (error: any) {
                                            setTransactionError(true);
                                            log(`❗️ Error while withdrawing: ${error.message}`);
                                            setPendingTx(false);
                                        }
                                    }}
                                >
                                    Withdraw
                                </button>
                            )}
                            {showApproveBtn && (
                                <button
                                    id="approve-btn"
                                    disabled={!approveEnabled || pendingTx}
                                    className={`zun-button approve-usd`}
                                    onClick={() => {
                                        if (approve) {
                                            approve();
                                        }
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
                                        setPendingTx(true);

                                        try {
                                            let tx = await deposit();

                                            log(`Deposit executed. Tx ID: ${tx}`);
                                            setTransactionId(tx);
                                            setDepositSum('0');
                                            log('Deposit success');
                                            log(JSON.stringify(`Transaction ID: ${tx}`));

                                            waitForTransaction({ hash: tx }).then(() => {
                                                setTimeout(() => {
                                                    setPendingTx(false);
                                                }, 5000);
                                            });

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
                                    }}
                                >
                                    Deposit
                                </button>
                            )}
                            {action === 'deposit' &&
                                coinApproved &&
                                !depositEnabled &&
                                !pendingTx && (
                                    <div className="text-muted text-danger ms-3 d-flex align-items-center">
                                        {depositValidationError}
                                    </div>
                                )}
                            {action === 'claim' && <button className={`zun-button`}>Claim</button>}
                            {(isApproving || pendingTx) && <Preloader className="ms-2" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
