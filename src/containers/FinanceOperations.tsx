import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { Form } from '../components/Form/Form';
import './FinanceOperations.scss';
import { Container, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { WelcomeCarousel } from '../components/WelcomeCarousel/WelcomeCarousel';
import { WithdrawOptions } from '../components/Form/WithdrawOptions/WithdrawOptions';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { BigNumber } from 'bignumber.js';
import { BIG_ZERO, getBalanceNumber, getFullDisplayBalance } from '../utils/formatbalance';
import { ReactComponent as FinIcon } from '../components/Form/deposit-withdraw.svg';
import useLpPrice from '../hooks/useLpPrice';
import { useUserBalances } from '../hooks/useUserBalances';
import { TransactionHistory } from '../components/TransactionHistory/TransactionHistory';
import { getTransHistoryUrl, getBackendSlippage } from '../api/api';
import useBalanceOf from '../hooks/useBalanceOf';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import { Contract } from 'web3-eth-contract';
import { calcWithdrawOneCoin } from '../utils/erc20';
import useSushi from '../hooks/useSushi';
import { getMasterChefContract } from '../sushi/utils';
import { isBSC, isETH, isPLG } from '../utils/zunami';
import { log } from '../utils/logger';
import { useSlippage } from '../hooks/useSlippage';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import useSupportedChain from '../hooks/useSupportedChain';
import { SideBar } from '../components/SideBar/SideBar';
import { Pendings } from '../components/Pendings/Pendings';
import usePendingOperations from '../hooks/usePendingOperations';
import { InfoBar } from '../components/InfoBar/InfoBar';

interface FinanceOperationsProps {
    operationName: string;
}

const calculateStables = async (
    coinIndex: number,
    balance: BigNumber,
    lpPrice: BigNumber,
    sharePercent: number,
    zunamiContract: Contract,
    setError: Function,
    account: string | null
) => {
    if (!zunamiContract || coinIndex === -1 || balance.toNumber() === 0) {
        return '0';
    }

    let result = '';

    const balanceToWithdraw = balance
        .dividedBy(lpPrice)
        .multipliedBy(sharePercent / 100)
        .toFixed(0)
        .toString();

    if (balanceToWithdraw === '0') {
        return '0';
    }

    setError('');

    try {
        result = await calcWithdrawOneCoin(balanceToWithdraw, coinIndex, account);
    } catch (error: any) {
        setError(
            `Error: ${error.message}. Params - coinIndex: ${coinIndex}, lpShares: ${balanceToWithdraw}`
        );
        return error;
    }

    return result;
};

export const FinanceOperations = (props: FinanceOperationsProps): JSX.Element => {
    const { account, connect, ethereum, chainId } = useWallet();
    const { getSlippage } = useSlippage();

    useEagerConnect(account ? account : '', connect, ethereum);

    const lpPrice = useLpPrice();
    const balance = useBalanceOf().multipliedBy(lpPrice);
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi);

    const [directOperation, setDirectOperation] = useState(false);
    const [daiChecked, setDaiChecked] = useState(false);
    const [usdcChecked, setUsdcChecked] = useState(false);
    const [usdtChecked, setUsdtChecked] = useState(false);
    const [sharePercent, setSharePercent] = useState(100);
    const [selectedCoin, setSelectedCoin] = useState<string>('all');
    const userBalanceList = useUserBalances();
    const [selectedCoinIndex, setSelectedCoinIndex] = useState(
        isBSC(chainId) && props.operationName === 'withdraw' ? 2 : -1
    );
    const [dai, setDai] = useState('0');
    const [usdc, setUsdc] = useState('0');
    const [usdt, setUsdt] = useState('0');
    const [busd, setBusd] = useState('0');
    const [calcError, setCalcError] = useState('');
    const [transactionList, setTransactionList] = useState([]);
    const [showMobileTransHistory, setShowMobileTransHistory] = useState(false);
    const [transHistoryPage, setTransHistoryPage] = useState(0);
    const [slippage, setSlippage] = useState('');

    // refetch transaction history if account/chain changes
    useEffect(() => {
        setTransHistoryPage(0);
        setTransactionList([]);
    }, [account, chainId]);

    useEffect(() => {
        if (isBSC(chainId) && props.operationName === 'withdraw') {
            setSelectedCoinIndex(2);
            setSelectedCoin('usdt');
        }

        if (isPLG(chainId) && props.operationName === 'withdraw') {
            setSelectedCoinIndex(2);
            setSelectedCoin('usdt');
        }

        if (isETH(chainId)) {
            setSelectedCoinIndex(-1);
            setSelectedCoin('all');
        }
    }, [props.operationName, chainId]);

    // withdraw max balance default set
    useEffect(() => {
        if (
            selectedCoinIndex === -1 &&
            balance !== BIG_ZERO &&
            !isNaN(sharePercent) &&
            props.operationName === 'withdraw'
        ) {
            const oneThird = getBalanceNumber(balance)
                .multipliedBy(sharePercent / 100)
                .dividedBy(3)
                .toFixed(2, 1)
                .toString();

            setDai(oneThird);
            setUsdc(oneThird);
            setUsdt(oneThird);

            if (chainId === 56) {
                setUsdt(getFullDisplayBalance(balance.multipliedBy(sharePercent / 100), 18));
            }
        }
    }, [balance, sharePercent, selectedCoinIndex, chainId, userBalanceList, props.operationName]);

    // calculate stables to withdraw
    useEffect(() => {
        const setCalculatedStables = async () => {
            if (
                balance === BIG_ZERO ||
                (selectedCoinIndex === -1 && !isNaN(sharePercent)) ||
                props.operationName !== 'withdraw' ||
                !chainId
            ) {
                return false;
            }

            log('setCalculatedStables');

            const stablesToWithdraw = await calculateStables(
                selectedCoinIndex,
                balance,
                lpPrice,
                sharePercent,
                zunamiContract,
                setCalcError,
                account
            );

            setDai('0');
            setUsdc('0');
            setUsdt('0');

            const percentOfBalance = balance.multipliedBy(sharePercent / 100);

            if (selectedCoinIndex === 0) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw))
                    .toFixed(2, 1)
                    .toString();
                setDai(coinValue);

                const slippage = await getBackendSlippage(
                    percentOfBalance.decimalPlaces(0).toString(),
                    0
                );

                setSlippage(slippage);

                log(`DAI slippage is ${slippage}`);
            } else if (selectedCoinIndex === 1) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw), 6)
                    .toFixed(2, 1)
                    .toString();
                setUsdc(coinValue);

                const slippage = await getBackendSlippage(
                    percentOfBalance.decimalPlaces(0).toString(),
                    1
                );

                setSlippage(slippage);

                log(`USDC slippage is ${slippage}`);
            } else if (selectedCoinIndex === 2) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw), 6)
                    .toFixed(2, 1)
                    .toString();
                setUsdt(coinValue);

                const slippage = await getBackendSlippage(
                    percentOfBalance.decimalPlaces(0).toString(),
                    2
                );

                setSlippage(slippage);

                log(`USDT slippage is ${slippage}`);
            }
        };

        setCalculatedStables();
    }, [
        balance.toNumber(),
        lpPrice,
        selectedCoinIndex,
        sharePercent,
        account,
        props.operationName,
        chainId,
        zunamiContract,
    ]);

    // load transaction list
    useEffect(() => {
        if (!account || transHistoryPage === -1) {
            return;
        }

        const getTransactionHistory = async () => {
            const response = await fetch(
                getTransHistoryUrl(
                    account,
                    props.operationName.toUpperCase(),
                    transHistoryPage,
                    10,
                    chainId
                )
            );

            const data = await response.json();

            if (!data.userTransfers.length) {
                setTransHistoryPage(-1);
                return;
            }

            setTransactionList(transactionList.concat(data.userTransfers));
        };

        getTransactionHistory();
    }, [account, props.operationName, transHistoryPage, chainId]);

    const supportedChain = useSupportedChain();
    const pendingOperations = usePendingOperations();

    const pendingWithdraw =
        lpPrice.toNumber() > 0 && pendingOperations.withdraw.toNumber() !== -1
            ? lpPrice.multipliedBy(pendingOperations.withdraw)
            : new BigNumber(0);

    return (
        <React.Fragment>
            <MobileSidebar />
            <div className="container h-100 d-flex justify-content-between flex-column">
                {!supportedChain && (
                    <UnsupportedChain text="You're using unsupported chain. Please, switch either to Ethereum or Binance network." />
                )}
                <div className="row main-row h-100">
                    <SideBar isMainPage={false}>
                        <Pendings
                            className={`d-none d-md-block`}
                            deposit={`$${getBalanceNumber(
                                pendingOperations.deposit,
                                isETH(chainId) || isPLG(chainId) ? 6 : 18
                            ).toFixed(2)}`}
                            withdraw={`$${getBalanceNumber(pendingWithdraw).toFixed(2)}`}
                        />
                        <TransactionHistory
                            className={`d-none d-md-block`}
                            title="Transactions history"
                            items={transactionList}
                            onPageEnd={() => {
                                if (transHistoryPage !== -1) {
                                    setTransHistoryPage(transHistoryPage + 1);
                                }
                            }}
                        />
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header />
                        <div
                            className="d-flex d-lg-none gap-3 mt-2 mb-2 pb-3 mobile-menu"
                            style={{
                                fontSize: '13px',
                                overflowX: 'scroll',
                            }}
                        >
                            <a
                                href="/dashboard"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/dashboard.png" alt="" />
                                <span className="text-muted mt-2">Dashboard</span>
                            </a>
                            <a
                                href="/deposit"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/deposit.png" alt="" />
                                <span className="text-muted mt-2">Deposit&Withdraw</span>
                            </a>
                            <a
                                href="/uzd"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/uzd.png" alt="" />
                                <span className="text-muted mt-2">UZD</span>
                            </a>
                            <a
                                href="/dao"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/dao.png" alt="" />
                                <span className="text-muted mt-2">DAO</span>
                            </a>
                        </div>
                        <InfoBar />
                        {!account && (
                            <Col className={'content-col'}>
                                <WelcomeCarousel />
                            </Col>
                        )}
                        {account && (
                            <Col className={'content-col'}>
                                <ToastContainer
                                    position={'top-end'}
                                    id="toasts"
                                    className={'toasts mt-3 me-3'}
                                >
                                    {calcError && (
                                        <Toast
                                            onClose={() => setCalcError('')}
                                            delay={10000}
                                            autohide
                                        >
                                            <Toast.Body>{calcError}</Toast.Body>
                                        </Toast>
                                    )}
                                </ToastContainer>

                                <div className={'DepositBlock'}>
                                    <div className={'DepositContent'}>
                                        {!showMobileTransHistory && (
                                            <div className="flex-wrap d-flex justify-content-start mt-3 mt-md-0">
                                                <Form
                                                    operationName={props.operationName}
                                                    directOperation={directOperation}
                                                    directOperationDisabled={false}
                                                    lpPrice={lpPrice}
                                                    sharePercent={sharePercent}
                                                    selectedCoinIndex={selectedCoinIndex}
                                                    dai={dai}
                                                    usdc={usdc}
                                                    usdt={usdt}
                                                    busd={busd}
                                                    slippage={slippage}
                                                    onCoinChange={async (
                                                        coinType: string,
                                                        coinValue: number
                                                    ) => {
                                                        if (coinType === 'dai') {
                                                            setDai(Number(coinValue).toString());
                                                        } else if (coinType === 'usdc') {
                                                            setUsdc(Number(coinValue).toString());
                                                        } else if (coinType === 'usdt') {
                                                            setUsdt(Number(coinValue).toString());
                                                        } else if (coinType === 'busd') {
                                                            setBusd(Number(coinValue).toString());

                                                            if (!Number(coinValue)) {
                                                                setSlippage('');
                                                                return;
                                                            }

                                                            const slippage = await getSlippage(
                                                                coinValue.toString()
                                                            );

                                                            const usdtValue = getFullDisplayBalance(
                                                                new BigNumber(slippage),
                                                                18
                                                            );

                                                            log(
                                                                `For ${coinValue} BUSD you'll get ${usdtValue} USDT`
                                                            );

                                                            const slippageValue =
                                                                Number(coinValue) -
                                                                Number(usdtValue);

                                                            const finalSlippage = (
                                                                (slippageValue / coinValue) *
                                                                100
                                                            ).toPrecision(2);

                                                            log(
                                                                `Final slippage is: ${finalSlippage}`
                                                            );

                                                            setSlippage(finalSlippage);
                                                        }
                                                    }}
                                                    onOperationModeChange={(direct: any) => {
                                                        setDirectOperation(!direct);

                                                        if (
                                                            direct &&
                                                            props.operationName === 'withdraw'
                                                        ) {
                                                            setSelectedCoin('all');
                                                            setSelectedCoinIndex(-1);
                                                            setDaiChecked(false);
                                                            setUsdcChecked(false);
                                                            setUsdtChecked(false);
                                                        } else {
                                                            setSharePercent(100);
                                                        }
                                                    }}
                                                />
                                                {props.operationName === 'Deposit' && (
                                                    <div className="Deposit__RightBlock flex-fill">
                                                        <div className="title">
                                                            Deposit Information
                                                        </div>
                                                        <div className="balance">
                                                            <div className="title">
                                                                Your balance
                                                            </div>
                                                            <div className="value">
                                                                ${' '}
                                                                {getBalanceNumber(balance).toFixed(
                                                                    3,
                                                                    1
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {props.operationName === 'withdraw' && (
                                                    <WithdrawOptions
                                                        chainId={chainId}
                                                        disabled={chainId === 56}
                                                        sharePercent={sharePercent}
                                                        daiChecked={daiChecked}
                                                        usdcChecked={usdcChecked}
                                                        usdtChecked={usdtChecked}
                                                        coinsSelectionEnabled={!directOperation}
                                                        selectedCoin={selectedCoin}
                                                        balance={balance}
                                                        lpPrice={lpPrice}
                                                        onCoinSelect={(coin: string) => {
                                                            if (!coin) {
                                                                return;
                                                            }

                                                            setSelectedCoin(coin);

                                                            if (coin === 'all') {
                                                                const sum =
                                                                    Number(dai) +
                                                                    Number(usdc) +
                                                                    Number(usdt);

                                                                const oneThird = (sum / 3)
                                                                    .toFixed(2)
                                                                    .toString();

                                                                setDai(oneThird);
                                                                setUsdc(oneThird);
                                                                setUsdt(oneThird);
                                                                setDirectOperation(false);
                                                                setSlippage('');
                                                            } else {
                                                                setDirectOperation(true);
                                                            }

                                                            const coins = ['dai', 'usdc', 'usdt'];

                                                            // -1 for "all"
                                                            setSelectedCoinIndex(
                                                                coins.indexOf(coin)
                                                            );
                                                        }}
                                                        onShareSelect={(percent: any) => {
                                                            setSharePercent(percent);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <TransactionHistory
                                    className={`d-block d-md-none`}
                                    title="Transactions history"
                                    items={transactionList}
                                    onPageEnd={() => {
                                        if (transHistoryPage !== -1) {
                                            setTransHistoryPage(transHistoryPage + 1);
                                        }
                                    }}
                                />
                            </Col>
                        )}
                    </div>
                    <div
                        className="d-flex justify-content-center d-md-none text-center flex-column ps-3 pe-3"
                        style={{ width: '100%', padding: '35px', color: '#B3B3B3' }}
                    >
                        <div
                            style={{ height: '2px', backgroundColor: '#EFEFEF', margin: '20px 0' }}
                        ></div>
                        <div className="text-center">About Zunami Protocol</div>
                        <p style={{ fontSize: '14px', marginTop: '20px', color: '#B3B3B3' }}>
                            Zunami is the DAO that works with stablecoins and solves the main issues
                            of current yield-farming protocols by streamlining interaction with
                            DeFi, making it easier and cheaper while increasing profitability by
                            differentiating and rebalancing users’ funds.
                        </p>
                        <div className="d-flex gap-2 mt-3 justify-content-center">
                            <a href="https://zunamilab.gitbook.io/product-docs/" className="badge rounded-pill text-bg-secondary bg-secondary">
                                Documentation
                            </a>
                            <a href="https://www.zunami.io/#faq-main" className="badge rounded-pill text-bg-secondary bg-secondary">
                                FAQ
                            </a>
                            <a href="https://zunami.io" className="badge rounded-pill text-bg-secondary bg-secondary">
                                Website
                            </a>
                        </div>
                        <div
                            style={{
                                height: '2px',
                                backgroundColor: '#EFEFEF',
                                margin: '50px 0 20px 0',
                            }}
                        ></div>
                        <p style={{ color: '#B3B3B3' }}>© 2023 Zunami Protocol. Version 4.0</p>
                        <div
                            style={{
                                height: '2px',
                                backgroundColor: '#EFEFEF',
                                margin: '5px 0 20px 0',
                            }}
                        ></div>
                        <div className="text-center">
                            <svg
                                width="99"
                                height="23"
                                viewBox="0 0 99 23"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21.3094 11.5247L21.31 11.0796C21.312 7.68233 21.3139 4.99893 20.0776 3.27385C19.6377 2.66659 19.0653 2.16782 18.4033 1.81614C17.4417 1.27555 16.501 1.14153 15.6707 1.02323L15.6037 1.01404C14.8449 0.91209 14.0802 0.863675 13.3149 0.870213H7.99517C7.22982 0.863675 6.46512 0.91209 5.70628 1.01404L5.63936 1.02323C4.80905 1.14153 3.86829 1.27555 2.90675 1.81614C2.2447 2.16781 1.67213 2.66659 1.2326 3.27385C-0.00395362 4.99893 -0.00213667 7.68233 0.000200148 11.0796L0.000391149 11.5247L0.000200148 11.9699C-0.00213667 15.3672 -0.00395238 18.0506 1.23267 19.7756C1.67213 20.3829 2.2447 20.8816 2.90675 21.2334C3.86829 21.7739 4.80905 21.908 5.63936 22.0263L5.70628 22.0355C6.46512 22.1374 7.22982 22.1858 7.99517 22.1792H13.3149C14.0802 22.1858 14.8449 22.1374 15.6038 22.0355L15.6707 22.0263C16.501 21.908 17.4417 21.7739 18.4033 21.2334C19.0653 20.8816 19.6377 20.3829 20.0776 19.7756C21.3139 18.0506 21.312 15.3672 21.31 11.9699L21.3094 11.5247L21.3094 11.5247ZM15.406 14.3804C14.7352 15.1233 13.4997 16.0283 11.4238 16.1207C11.3185 16.1253 11.214 16.1277 11.1102 16.1277C9.49278 16.1277 8.0557 15.5609 6.93802 14.4782C6.18942 13.7531 5.61207 12.8216 5.22205 11.7097C4.83646 10.6103 4.64094 9.34876 4.64094 7.95994H7.1589C7.1589 9.05746 7.30559 10.0322 7.5949 10.857C7.85221 11.5906 8.21693 12.1894 8.67896 12.637C9.36975 13.3061 10.2561 13.6215 11.3132 13.5746C12.2875 13.5312 13.0392 13.2238 13.5474 12.6609C13.9704 12.1925 14.2034 11.5591 14.2034 10.8775C14.2092 10.4898 14.0663 10.115 13.8047 9.83187C13.6822 9.70111 13.5342 9.5975 13.3701 9.52756C13.2059 9.45761 13.0293 9.42283 12.8512 9.42548C12.6054 9.42739 12.3687 9.52052 12.1862 9.68723C12.0106 9.8537 11.8014 10.197 11.8014 10.8868H9.28342C9.28342 9.28424 9.92562 8.33869 10.4643 7.82764C11.1137 7.21846 11.9658 6.87906 12.8512 6.8769C13.3691 6.87407 13.8821 6.9783 14.3588 7.18331C14.8354 7.38826 15.2657 7.68967 15.6232 8.06892C16.3314 8.81735 16.7214 9.81478 16.7214 10.8775C16.7214 12.197 16.2542 13.441 15.406 14.3804L15.406 14.3804Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M95.6019 16.4278V6.24515H97.8645V16.4278H95.6019ZM97.4962 4.59509L97.528 4.56298C97.7712 4.31777 97.9632 4.12411 97.9968 3.91054C98.0083 3.83503 98.0023 3.75782 97.9794 3.68477C97.9482 3.57653 97.8894 3.49915 97.8375 3.43085L97.8333 3.42538C97.7855 3.3634 97.7334 3.30488 97.6773 3.25027L97.2907 2.86744C97.2356 2.81189 97.1766 2.76035 97.1141 2.71311L97.1086 2.70895C97.0398 2.65774 96.9619 2.59972 96.8533 2.56957C96.7801 2.54732 96.7028 2.54214 96.6274 2.55437C96.4141 2.58997 96.2224 2.7839 95.9795 3.02943L95.9477 3.06159L95.9159 3.09373C95.6727 3.33892 95.4806 3.53259 95.4471 3.74617C95.4356 3.82166 95.4415 3.89888 95.4645 3.97193C95.4957 4.08017 95.5545 4.15755 95.6064 4.22585L95.6106 4.23132C95.6584 4.2933 95.7105 4.35182 95.7666 4.40643L96.1532 4.78926C96.2083 4.84481 96.2673 4.89635 96.3298 4.94359L96.3353 4.94775C96.4041 4.99895 96.482 5.05698 96.5906 5.08713C96.6638 5.10937 96.7411 5.11454 96.8165 5.10234C97.0297 5.06672 97.2215 4.87278 97.4644 4.62729L97.4962 4.59509V4.59509Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M89.549 5.96539C88.1175 5.96539 86.8331 6.66495 85.9522 7.77437C85.5025 7.20967 84.9309 6.75374 84.2804 6.44053C83.63 6.12732 82.9172 5.9649 82.1952 5.96539C81.8264 5.96519 81.4591 6.01228 81.1023 6.10551C80.7791 6.19191 80.4797 6.34989 80.2259 6.56776C79.9723 6.78562 79.771 7.05778 79.6368 7.36407V6.24639H78.5729V6.24812H77.3867V16.4308H79.6495V11.3395C79.6495 9.46517 80.7891 7.9454 82.1952 7.9454C83.6011 7.9454 84.7408 9.21188 84.7408 10.774V16.4308H87.0036V11.3395C87.0036 9.46517 88.1432 7.9454 89.549 7.9454C90.955 7.9454 92.0946 9.21188 92.0946 10.774V16.4308H94.3574V10.774C94.3574 10.1426 94.2332 9.51724 93.9914 8.93382C93.7498 8.35039 93.3957 7.82028 92.9492 7.37374C92.5026 6.92722 91.9726 6.57301 91.3892 6.33136C90.8058 6.08971 90.1804 5.96536 89.549 5.96539Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M74.7679 6.24814V6.24642H73.704V7.57274C73.4649 7.10015 73.0682 6.72596 72.5825 6.51488C71.7372 6.1498 70.8257 5.96277 69.9049 5.96542C66.5469 5.96542 63.8242 8.37124 63.8242 11.3395C63.8242 14.3072 65.9767 16.7135 68.6326 16.7135C71.2881 16.7135 73.3188 14.561 73.3188 11.9049H71.0558C71.0558 12.6243 70.9538 13.3158 70.5557 13.815C70.3255 14.1037 70.0328 14.3363 69.6997 14.4955C69.3667 14.6546 69.0017 14.736 68.6326 14.7335C67.2264 14.7335 66.0868 13.2138 66.0868 11.3395C66.0868 9.46518 67.7969 7.94541 69.9049 7.94541C72.014 7.94541 73.7236 9.46519 73.7236 11.3395V16.4308H75.9863V6.24814H74.7679Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M58.2256 5.96554C57.2856 5.95939 56.3548 6.15118 55.4937 6.52847C55.0137 6.74265 54.6244 7.11902 54.3942 7.59154V6.24654H53.3304V6.24824H52.1211V16.4309H54.3839V11.3396C54.3839 9.46531 56.0938 7.94553 58.202 7.94553C59.6078 7.94553 60.7474 9.212 60.7474 10.7742V16.4309H63.01V10.7886C63.0122 9.51551 62.5101 8.29336 61.6135 7.38952C60.7168 6.48567 59.4987 5.97368 58.2256 5.96554Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M48.4505 6.24811V11.3395C48.4505 13.2137 46.7405 14.7335 44.6326 14.7335C43.2265 14.7335 42.0869 13.467 42.0869 11.9049V6.24811H39.8242V11.8904C39.8222 13.1635 40.3244 14.3856 41.221 15.2894C42.1176 16.1933 43.3356 16.7053 44.6087 16.7135C45.5487 16.7197 46.4795 16.5278 47.3406 16.1506C47.8209 15.936 48.2104 15.5592 48.4408 15.0863V16.4308H50.7132V6.24811H48.4505Z"
                                    fill="#B3B3B3"
                                />
                                <path
                                    d="M29.2773 7.34679V8.25051H35.4347L29.2773 14.3725V16.4191H38.63V14.3725H38.0676V14.3723H32.5861L32.9226 13.9853C32.9447 13.9621 32.9665 13.9386 32.9876 13.9144L33.6856 13.2191L38.63 8.15598V6.25006H29.2773V7.34679Z"
                                    fill="#B3B3B3"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
