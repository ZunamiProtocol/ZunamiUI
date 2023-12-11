import './FastDepositForm.scss';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances, coins, getCoinAddressByIndex } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import useAllowance, { useAllowanceStables } from '../../hooks/useAllowance';
import useStake from '../../hooks/useStake';
import { getActiveWalletName } from '../WalletsModal/WalletsModal';
import { BIG_ZERO } from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { log } from '../../utils/logger';
import { getChainClient, isBSC, isETH, isPLG, isSEP } from '../../utils/zunami';
import { ActionSelector } from '../Form/ActionSelector/ActionSelector';
import useApproveUzd from '../../hooks/useApproveUzd';
import useApproveZeth from '../../hooks/useApproveZeth';
import { contractAddresses } from '../../sushi/lib/constants';
import useZapsLpBalance from '../../hooks/useZapsLpBalance';
import BigNumber from 'bignumber.js';
import useZethApsBalance from '../../hooks/useZethApsBalance';
import useApproveZAPSLP from '../../hooks/useApproveZAPSLP';
import useApproveLP from '../../hooks/useApproveLP';
import { DirectAction } from '../Form/DirectAction/DirectAction';
import {
    useAccount,
    useNetwork,
    Address,
    useContractRead,
    useContractWrite,
    sepolia,
    erc20ABI,
} from 'wagmi';
import { WalletButton } from '../WalletButton/WalletButton';
import { ApproveButton } from '../ApproveButton/ApproveButton';
import { TransactionReceipt } from 'viem';
import { ReactComponent as StakingUzdLogo } from './assets/uzd-logo.svg';
import { ReactComponent as StakingZethLogo } from './assets/zeth-logo.svg';
import { ReactComponent as MobileToggleIcon } from './assets/mobile-toggle-icon.svg';
// import sepoliaAbi from '../../actions/abi/sepolia/ZunamiPool.json';
import sepoliaAbi from '../../actions/abi/Zunami.json';
import { getScanAddressByChainId, renderToasts, FastDepositFormProps } from './types';
import useBalanceOf from '../../hooks/useBalanceOf';
import erc20TokenAbi from '../../actions/abi/sepolia/ERC20Token.json';
// import controllerABI from '../../actions/abi/sepolia/controller.json';
import { getPublicClient } from '@wagmi/core';
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
    // const [coin, setCoin] = useState(stakingMode === 'UZD' ? 'UZD' : 'ZETH');
    const [depositSum, setDepositSum] = useState('');
    const [withdrawSum, setWithdrawSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [coinIndex, setCoinIndex] = useState(0);

    // Current contract address
    const contractAddress: Address = '0x83287Da602f0C32f6C9B09E2F1b2951767ebF239';

    const allowance = useAllowanceStables(account, contractAddress, chainId);

    // APS balance
    const apsBalance = BIG_ZERO;
    // ZETH APS balance
    const zethApsBalance = BIG_ZERO;

    useEffect(() => {
        if (action === 'withdraw') {
            setWithdrawSum('');
        }
    }, [stakingMode, action]);

    useEffect(() => {
        let preselectedCoin = stakingMode === 'UZD' ? 'zunUSD' : 'zunETH';

        if (action === 'withdraw' && stakingMode === 'ZETH') {
            preselectedCoin = 'ethZAPSLP';
        }

        if (action === 'withdraw' && stakingMode === 'UZD') {
            preselectedCoin = 'ZAPSLP';
        }

        if (action === 'claim') {
            preselectedCoin = 'ZUN';
        }

        // setCoin(preselectedCoin);
        setCoinIndex(coins.indexOf(preselectedCoin));
    }, [stakingMode, action]);

    // get user max balance
    const fullBalance = useMemo(() => {
        let decimalPlaces = 18;
        let digits = 18;

        if (userBalanceList[coinIndex] && !userBalanceList[coinIndex].toNumber()) {
            decimalPlaces = 0;
        }

        // const isDaiOrFrax = coinIndex === 2 || coinIndex === 5;

        if (chainId === sepolia.id) {
            decimalPlaces = 6;
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

    const coinApproved = useMemo(() => {
        if (action === 'deposit') {
            return allowance[coinIndex].toNumber() > 0;
        } else {
            return allowance[coinIndex].toNumber() > 0;
        }
    }, [allowance, coinIndex, action]);

    const showApproveBtn = useMemo(() => {
        let result = !coinApproved;

        // if (!isETH(chainId)) {
        //     result = false;
        // }

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

        // if (coin === 'UZD' && !apsBalance.toNumber()) {
        //     result = false;
        // }

        if (!Number(withdrawSum)) {
            result = false;
        }

        return result;
    }, [withdrawSum]);

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

    // set deposit/withdraw maximum on coin change
    useEffect(() => {
        if (action === 'withdraw' && withdrawSum === '') {
            let decimalPlaces = 18;

            if (stakingMode === 'UZD') {
                if (!apsBalance.toNumber()) {
                    decimalPlaces = 0;
                }

                setWithdrawSum(getFullDisplayBalance(apsBalance, 18, decimalPlaces));
            }

            if (stakingMode === 'ZETH') {
                if (!zethApsBalance.toNumber()) {
                    decimalPlaces = 0;
                }

                setWithdrawSum(getFullDisplayBalance(zethApsBalance, 18, decimalPlaces));
            }
        }
    }, [action, apsBalance, zethApsBalance, withdrawSum, stakingMode]);

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
                result = zethApsBalance;
            }
        }

        return result;
    }, [action, stakingMode, coinIndex, userBalanceList, zethApsBalance, apsBalance, chainId]);

    const deposit = useCallback(() => {}, [stakingMode]);
    const withdraw = useCallback(() => {}, [stakingMode]);

    const {
        data: approveResult,
        isLoading: isApproving,
        isSuccess: approveSuccessful,
        write: approve,
    } = useApprove(getCoinAddressByIndex(coinIndex, chainId ?? 1), contractAddress, APPROVE_SUM);

    if (isApproving) {
        console.log(approveResult, approveSuccessful);
    }

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
                                {
                                    name: 'claim',
                                    title: 'Claim',
                                    disabled: true,
                                },
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
                            {
                                name: 'claim',
                                title: 'Claim',
                            },
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
                        {action === 'deposit' && (
                            <div className="checkboxes">
                                <div className="d-flex gap-4 mb-3 flex-column flex-md-row">
                                    {!pendingTx && (
                                        <DirectAction
                                            actionName="deposit"
                                            checked={lockAndBoost}
                                            title={'Lock and boost APY to 25%'}
                                            disabled={!coinApproved || !isETH(chainId)}
                                            hint={
                                                'You can lock your deposit for 4 months to receive additional rewards in ZUN tokens.'
                                            }
                                            onChange={(state: boolean) => {
                                                setLockAndBoost(state);
                                            }}
                                            chainId={chainId ?? 1}
                                        />
                                    )}
                                    {/* {!pendingTx && (
                                        <DirectAction
                                            actionName="deposit"
                                            checked={autoRelock}
                                            title={'Auto-relock'}
                                            disabled={!coinApproved || !isETH(chainId)}
                                            hint={'Example tooltip text'}
                                            onChange={(state: boolean) => {
                                                setAutoRelock(state);
                                            }}
                                            chainId={chainId}
                                        />
                                    )} */}
                                </div>
                            </div>
                        )}
                        <div className="buttons">
                            {action === 'withdraw' && coinApproved && (
                                <button
                                    className={`zun-button ${withdrawEnabled ? '' : 'disabled'}`}
                                    onClick={withdraw}
                                >
                                    Withdraw
                                </button>
                            )}
                            {showApproveBtn && (
                                <button
                                    className={`zun-button approve-usd ${
                                        !approveEnabled ? 'disabled' : ''
                                    }`}
                                    onClick={() => {
                                        approve();
                                    }}
                                >
                                    Approve
                                </button>
                            )}
                        </div>
                        {pendingTx && <Preloader className="ms-2" />}
                    </div>
                    <div className="d-flex gap-3 align-items-center mt-3 flex-column flex-md-row">
                        {action === 'deposit' && coinApproved && (
                            <button
                                className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                onClick={deposit}
                            >
                                Deposit
                            </button>
                        )}
                        {action === 'deposit' && coinApproved && !depositEnabled && (
                            <div className="text-muted text-danger ms-3">
                                {depositValidationError}
                            </div>
                        )}
                        {action === 'claim' && <button className={`zun-button`}>Claim</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};
