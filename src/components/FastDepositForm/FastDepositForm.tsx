import './FastDepositForm.scss';
import { useState, useMemo, useEffect } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';
import { Input } from './Input/Input';
import { Preloader } from '../Preloader/Preloader';
import { useUserBalances } from '../../hooks/useUserBalances';
import { WalletStatus } from '../WalletStatus/WalletStatus';
import { DirectAction } from '../Form/DirectAction/DirectAction';
import { useAllowanceStables } from '../../hooks/useAllowance';
import useApprove from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import { getActiveWalletName } from '../WalletsModal/WalletsModal';
import {
    daiAddress,
    usdcAddress,
    usdtAddress,
    bscUsdtAddress,
    busdAddress,
    plgUsdtAddress,
} from '../../utils/formatbalance';
import { getFullDisplayBalance } from '../../utils/formatbalance';
import { Link } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import { log } from '../../utils/logger';
import { isBSC, isETH, isPLG } from '../../utils/zunami';

function coinNameToAddress(coinName: string, chainId: number): string {
    if (chainId === 56 && coinName === 'USDT') {
        return bscUsdtAddress;
    }

    let address = daiAddress;

    switch (coinName) {
        case 'USDC':
            address = usdcAddress;
            break;
        case 'USDT':
            address = isPLG(chainId) ? plgUsdtAddress : usdtAddress;
            break;
        case 'BUSD':
            address = busdAddress;
            break;
    }

    return address;
}

function getScanAddressByChainId(chainId: number) {
    let address = 'etherscan.io';

    switch (chainId) {
        case 56:
            address = 'bscscan.com';
            break;
        case 137:
            address = 'polygonscan.com';
            break;
    }

    return address;
}

export const FastDepositForm = (): JSX.Element => {
    const userBalanceList = useUserBalances();
    const { chainId, account } = useWallet();
    const [optimized, setOptimized] = useState(true);
    const [pendingApproval, setPendingApproval] = useState(false);
    const [coin, setCoin] = useState('USDC');
    const [depositSum, setDepositSum] = useState('');
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [coinIndex, setCoinIndex] = useState(-1);
    const approveList = useAllowanceStables();
    const approvedTokens = [
        approveList ? approveList[0].toNumber() > 0 : false,
        approveList ? approveList[1].toNumber() > 0 : false,
        approveList ? approveList[2].toNumber() > 0 : false,
        approveList ? approveList[3].toNumber() > 0 : false,
    ];

    const coins = useMemo(() => {
        return ['DAI', 'USDC', 'USDT', 'BUSD'];
    }, []);

    const { onApprove } = useApprove();
    const { onStake } = useStake(
        [
            {
                name: 'DAI',
                value: coin === 'DAI' ? depositSum : '0',
            },
            {
                name: 'USDC',
                value: coin === 'USDC' ? depositSum : '0',
            },
            {
                name: 'USDT',
                value: coin === 'USDT' ? depositSum : '0',
            },
            {
                name: 'BUSD',
                value: coin === 'BUSD' ? depositSum : '0',
            },
        ],
        !optimized
    );

    useEffect(() => {
        if (coinIndex === -1) {
            setCoin(chainId !== 1 ? 'USDT' : 'USDC');
            setCoinIndex(coins.indexOf(coin));
        }

        if (chainId === 56 && coinIndex !== 3) {
            setCoin('USDT');
            setCoinIndex(coins.indexOf(coin));
        }

        if (isPLG(chainId) && coinIndex !== 3) {
            setCoin('USDT');
            setCoinIndex(coins.indexOf(coin));
        }
    }, [chainId, coin, coinIndex, coins]);

    // get user max balance
    const fullBalance = useMemo(() => {
        if (isBSC(chainId)) {
            return getFullDisplayBalance(userBalanceList[coinIndex], 18);
        } else if (isETH(chainId)) {
            return getFullDisplayBalance(userBalanceList[coinIndex], coin === 'DAI' ? 18 : 6);
        } else if (isPLG(chainId)) {
            return getFullDisplayBalance(userBalanceList[coinIndex], coin === 'DAI' ? 18 : 6);
        }
    }, [userBalanceList, coin, coinIndex, chainId]);

    const depositEnabled =
        approvedTokens[coinIndex] &&
        Number(depositSum) > 0 &&
        !pendingApproval &&
        Number(depositSum) <= Number(fullBalance);

    // set default input to max
    useEffect(() => {
        if (!fullBalance) {
            return;
        }

        setDepositSum(fullBalance.toString());
    }, [fullBalance]);

    return (
        <div className="FastDepositForm">
            <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
                {transactionError && (
                    <Toast onClose={() => setTransactionError(false)} delay={5000} autohide>
                        <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                    </Toast>
                )}
                {transactionId && (
                    <Toast onClose={() => setTransactionId(undefined)} delay={15000} autohide>
                        <Toast.Body>
                            Success! Check out the{' '}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={`https://${getScanAddressByChainId(
                                    chainId
                                )}/tx/${transactionId}`}
                            >
                                transaction
                            </a>
                        </Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
            <div className="d-flex justify-content-between align-items-center">
                <span className="FastDepositForm__Title">
                    <svg
                        width="37"
                        height="38"
                        viewBox="0 0 37 38"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15.5741 20.8429C14.1291 19.8035 12.798 18.846 11.4669 17.8886C10.3324 17.0726 9.19815 16.2566 8.06397 15.4403C7.24073 14.8458 7.3196 13.8823 8.2317 13.4343C17.1096 9.07393 25.9881 4.71462 34.8671 0.356412C35.0415 0.270808 35.212 0.1762 35.3905 0.100563C35.9264 -0.126441 36.4588 0.0374595 36.7973 0.525649C36.9506 0.741125 37.0207 1.00499 36.9947 1.26832C36.9686 1.53165 36.8481 1.77657 36.6555 1.95767C35.7524 2.84275 34.8364 3.71464 33.9248 4.591C30.515 7.86898 27.1047 11.1464 23.6937 14.4232C23.5968 14.5053 23.4956 14.5822 23.3906 14.6537C23.5517 14.7772 23.6507 14.8574 23.754 14.9316C25.9242 16.4923 28.0952 18.0519 30.267 19.6104C30.5996 19.8486 30.8472 20.1253 30.863 20.557C30.8817 21.0662 30.6304 21.4025 30.1979 21.6377C28.8541 22.3684 27.5121 23.1024 26.1719 23.8396C18.0664 28.2724 9.96078 32.7049 1.85495 37.1371C1.72913 37.2102 1.59816 37.2741 1.46307 37.3282C1.24523 37.4095 1.0069 37.4179 0.783915 37.352C0.56093 37.286 0.365332 37.1494 0.226514 36.9625C-0.0652715 36.5703 -0.0795695 36.0621 0.209292 35.6709C0.330421 35.5188 0.463784 35.377 0.60805 35.2467C5.46236 30.5414 10.3179 25.8373 15.1747 21.1345C15.278 21.0344 15.4085 20.9624 15.5741 20.8429Z"
                            fill="url(#paint0_linear_101_847)"
                        />
                        <defs>
                            <linearGradient
                                id="paint0_linear_101_847"
                                x1="2.5"
                                y1="33"
                                x2="45"
                                y2="-11"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#E2E2E2" />
                                <stop offset="1" stopColor="#ECECEC" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>Fast deposit</span>
                </span>
                <Link className="FastDepositForm__Description" to="/deposit">
                    Make your first deposit!
                </Link>
            </div>
            <div className="FastDepositForm__MobileToggle">
                <svg
                    width="37"
                    height="38"
                    viewBox="0 0 37 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="FastDepositForm__MobileToggle__Icon"
                >
                    <path
                        d="M15.5741 20.8429C14.1291 19.8035 12.798 18.846 11.4669 17.8886C10.3324 17.0726 9.19815 16.2566 8.06397 15.4403C7.24073 14.8458 7.3196 13.8823 8.2317 13.4343C17.1096 9.07393 25.9881 4.71462 34.8671 0.356412C35.0415 0.270808 35.212 0.1762 35.3905 0.100563C35.9264 -0.126441 36.4588 0.0374595 36.7973 0.525649C36.9506 0.741125 37.0207 1.00499 36.9947 1.26832C36.9686 1.53165 36.8481 1.77657 36.6555 1.95767C35.7524 2.84275 34.8364 3.71464 33.9248 4.591C30.515 7.86898 27.1047 11.1464 23.6937 14.4232C23.5968 14.5053 23.4956 14.5822 23.3906 14.6537C23.5517 14.7772 23.6507 14.8574 23.754 14.9316C25.9242 16.4923 28.0952 18.0519 30.267 19.6104C30.5996 19.8486 30.8472 20.1253 30.863 20.557C30.8817 21.0662 30.6304 21.4025 30.1979 21.6377C28.8541 22.3684 27.5121 23.1024 26.1719 23.8396C18.0664 28.2724 9.96078 32.7049 1.85495 37.1371C1.72913 37.2102 1.59816 37.2741 1.46307 37.3282C1.24523 37.4095 1.0069 37.4179 0.783915 37.352C0.56093 37.286 0.365332 37.1494 0.226514 36.9625C-0.0652715 36.5703 -0.0795695 36.0621 0.209292 35.6709C0.330421 35.5188 0.463784 35.377 0.60805 35.2467C5.46236 30.5414 10.3179 25.8373 15.1747 21.1345C15.278 21.0344 15.4085 20.9624 15.5741 20.8429Z"
                        fill="url(#paint0_linear_317_13101)"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_317_13101"
                            x1="2.5"
                            y1="33"
                            x2="45"
                            y2="-11"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stop-color="#FFA902" />
                            <stop offset="1" stop-color="#FFCF54" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="FastDepositForm__MobileToggle__Title">Fast Deposit</div>
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
                    setCoinIndex(['DAI', 'USDC', 'USDT', 'BUSD'].indexOf(coin));
                }}
                chainId={chainId}
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
                                onClick={async () => {
                                    setPendingApproval(true);
                                    setPendingTx(true);

                                    if (!chainId) {
                                        return;
                                    }

                                    try {
                                        await onApprove(coinNameToAddress(coin, chainId));
                                        log('USDT approved!');
                                    } catch (error: any) {
                                        log(`Error while approving ${coin}: ${error.message}`);
                                        setPendingApproval(false);
                                        setPendingTx(false);
                                    }

                                    setPendingApproval(false);
                                    setPendingTx(false);
                                }}
                            >
                                Approve
                            </button>
                        )}
                        {approvedTokens[coinIndex] && (
                            <button
                                className={`zun-button ${depositEnabled ? '' : 'disabled'}`}
                                onClick={async () => {
                                    setPendingTx(true);

                                    try {
                                        const tx = await onStake();
                                        setTransactionId(tx.transactionHash);
                                        setDepositSum('0');
                                        log('Deposit success');
                                        log(JSON.stringify(tx));

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
                                        setTransactionError(true);
                                        log(`❗️ Deposit error: ${error.message}`);
                                        log(JSON.stringify(error));
                                    }

                                    setPendingTx(false);
                                }}
                            >
                                Deposit
                            </button>
                        )}
                        {!pendingTx && (
                            <DirectAction
                                actionName="deposit"
                                checked={optimized}
                                disabled={chainId !== 1 || false}
                                hint={`${
                                    chainId === 1
                                        ? 'When using optimized deposit funds will be deposited within 24 hours and many times cheaper'
                                        : 'When using deposit funds will be deposited within 24 hours, because users’ funds accumulate in one batch and distribute to the ETH network in Zunami App.'
                                }`}
                                onChange={(state: boolean) => {
                                    setOptimized(state);
                                }}
                            />
                        )}
                        {pendingTx && <Preloader className="ms-2" />}
                    </div>
                )}
            </div>
        </div>
    );
};
