import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { SideBar } from '../components/SideBar/SideBar';
import { Form } from '../components/Form/Form';
import './FinanceOperations.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import { WelcomeCarousel } from '../components/WelcomeCarousel/WelcomeCarousel';
import { WithdrawOptions } from '../components/Form/WithdrawOptions/WithdrawOptions';
import { BigNumber } from 'bignumber.js';
import { getMasterChefContract } from '../sushi/utils';
import useSushi from '../hooks/useSushi';
import { calcWithdrawOneCoin, getBalanceNew } from '../utils/erc20';
import { Contract } from 'web3-eth-contract';
import { BIG_ZERO, getBalanceNumber } from '../utils/formatbalance';
import { ReactComponent as FinIcon } from '../components/Form/deposit-withdraw.svg';
import useLpPrice from '../hooks/useLpPrice';

import { TransactionHistory } from '../components/TransactionHistory/TransactionHistory';
import { getTransHistoryUrl } from '../api/api';
import { log } from '../utils/logger';

interface FinanceOperationsProps {
    operationName: string;
}

const calculateStables = async (
    coinIndex: number,
    balance: BigNumber,
    sharePercent: number,
    zunamiContract: Contract
) => {
    if (!zunamiContract || coinIndex === -1 || balance.toNumber() === 0) {
        return '0';
    }

    let result = '';

    const balanceToWithdraw = balance
        .multipliedBy(sharePercent / 100)
        .toFixed(0)
        .toString();

    console.log(`CalcWithdrawOneCoin execution...(${balanceToWithdraw}, ${coinIndex})`);
    result = await calcWithdrawOneCoin(zunamiContract, balanceToWithdraw, coinIndex);
    console.log(
        `CalcWithdrawOneCoin result: ${result}. Props (balanceToWithdraw: ${balanceToWithdraw}, coinIndex: ${coinIndex})`
    );
    return result;
};

export const FinanceOperations = (props: FinanceOperationsProps): JSX.Element => {
    const { account, connect, ethereum } = useWallet();
    useEagerConnect(account ? account : '', connect, ethereum);

    const [daiDisabled, setDaiDisabled] = useState(props.operationName === 'Withdraw');
    const [usdcDisabled, setUsdcDisabled] = useState(props.operationName === 'Withdraw');
    const [usdtDisabled, setUsdtDisabled] = useState(props.operationName === 'Withdraw');

    const [directOperation, setDirectOperation] = useState(false);

    const [daiChecked, setDaiChecked] = useState(false);
    const [usdcChecked, setUsdcChecked] = useState(false);
    const [usdtChecked, setUsdtChecked] = useState(false);
    const [sharePercent, setSharePercent] = useState(100);

    const [selectedCoin, setSelectedCoin] = useState<string>('all');
    const [balance, setBalance] = useState(BIG_ZERO);
    const [rawBalance, setRawBalance] = useState(BIG_ZERO);
    const [coins, setCoins] = useState([0, 0, 0]);
    const [selectedCoinIndex, setSelectedCoinIndex] = useState(-1);

    const [dai, setDai] = useState('0');
    const [usdc, setUsdc] = useState('0');
    const [usdt, setUsdt] = useState('0');

    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi);
    const lpPrice = useLpPrice();
    const [transactionList, setTransactionList] = useState([]);

    useEffect(() => {
        if (
            !zunamiContract ||
            !account ||
            props.operationName !== 'Withdraw' ||
            lpPrice.toNumber() === 0
        ) {
            return;
        }

        const loadBalance = async () => {
            const rBalance = new BigNumber(await getBalanceNew(zunamiContract, account));
            setRawBalance(rBalance);
            setBalance(Number(lpPrice) > 0 ? lpPrice.multipliedBy(rBalance) : rBalance);
        };

        loadBalance();
    }, [account, zunamiContract, props.operationName, lpPrice]);

    useEffect(() => {
        if (selectedCoinIndex === -1 && balance !== BIG_ZERO) {
            const oneThird = getBalanceNumber(balance)
                .multipliedBy(sharePercent / 100)
                .dividedBy(3)
                .toFixed(2, 1)
                .toString();

            setDai(oneThird);
            setUsdc(oneThird);
            setUsdt(oneThird);
        }
    }, [balance, sharePercent, selectedCoinIndex]);

    useEffect(() => {
        const setCalculatedStables = async () => {
            if (!zunamiContract || balance === BIG_ZERO || selectedCoinIndex === -1) {
                return false;
            }

            const stablesToWithdraw = await calculateStables(
                selectedCoinIndex,
                rawBalance,
                sharePercent,
                zunamiContract
            );

            setDai('0');
            setUsdc('0');
            setUsdt('0');

            if (selectedCoinIndex === 0) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw))
                    .toFixed(2, 1)
                    .toString();
                setDai(coinValue);
            } else if (selectedCoinIndex === 1) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw), 6)
                    .toFixed(2, 1)
                    .toString();
                setUsdc(coinValue);
            } else if (selectedCoinIndex === 2) {
                const coinValue = getBalanceNumber(new BigNumber(stablesToWithdraw), 6)
                    .toFixed(2, 1)
                    .toString();
                setUsdt(coinValue);
            }
        };

        setCalculatedStables();
    }, [balance, selectedCoinIndex, sharePercent, zunamiContract, rawBalance]);

    useEffect(() => {
        if (!account) {
            return;
        }

        const getTransactionHistory = async () => {
            const response = await fetch(
                getTransHistoryUrl(account, props.operationName.toUpperCase())
            );

            const data = await response.json();
            setTransactionList(data.userTransfers);
        };

        getTransactionHistory();
    }, [account, props.operationName]);

    return (
        <React.Fragment>
            <Header />
            <Container className={'h-100 d-flex justify-content-between flex-column'}>
                <Row className={'h-100 mb-4 main-row'}>
                    {/* <SideBar isMainPage={true} /> */}
                    {!account && (
                        <Col className={'content-col'}>
                            <WelcomeCarousel />
                        </Col>
                    )}
                    {account && (
                        <Col className={'content-col'}>
                            <Row className={'zun-rounded zun-shadow h-100 operation-col'}>
                                <Col className={'ps-0 pe-0'}>
                                    <div className={'DepositBlock'}>
                                        <div className={'DepositContent'}>
                                            <h3 className="DepositContent__Title">
                                                <FinIcon />
                                                Deposit & Withdraw
                                            </h3>
                                            <div className="flex-wrap d-flex justify-content-start">
                                                <Form
                                                    operationName={props.operationName}
                                                    daiDisabled={daiDisabled}
                                                    usdcDisabled={usdcDisabled}
                                                    usdtDisabled={usdtDisabled}
                                                    directOperation={directOperation}
                                                    directOperationDisabled={
                                                        props.operationName === 'Withdraw' &&
                                                        selectedCoin === 'all'
                                                    }
                                                    lpPrice={lpPrice}
                                                    sharePercent={sharePercent}
                                                    selectedCoinIndex={selectedCoinIndex}
                                                    dai={dai}
                                                    usdc={usdc}
                                                    usdt={usdt}
                                                    onCoinChange={(
                                                        coinType: string,
                                                        coinValue: number
                                                    ) => {
                                                        setCoins([
                                                            coinType === 'dai' ? coinValue : 0,
                                                            coinType === 'usdc' ? coinValue : 0,
                                                            coinType === 'usdt' ? coinValue : 0,
                                                        ]);

                                                        if (coinType === 'dai') {
                                                            setDai(Number(coinValue).toString());
                                                        } else if (coinType === 'usdc') {
                                                            setUsdc(Number(coinValue).toString());
                                                        } else {
                                                            setUsdt(Number(coinValue).toString());
                                                        }
                                                    }}
                                                    onOperationModeChange={(direct: any) => {
                                                        setDirectOperation(!direct);

                                                        if (
                                                            direct &&
                                                            props.operationName === 'Withdraw'
                                                        ) {
                                                            setSelectedCoin('all');
                                                            setDaiDisabled(true);
                                                            setUsdcDisabled(true);
                                                            setUsdtDisabled(true);
                                                            setDaiChecked(false);
                                                            setUsdcChecked(false);
                                                            setUsdtChecked(false);
                                                        } else {
                                                            setSharePercent(100);
                                                        }
                                                    }}
                                                />
                                                {props.operationName === 'Withdraw' && (
                                                    <WithdrawOptions
                                                        sharePercent={sharePercent}
                                                        daiChecked={daiChecked}
                                                        usdcChecked={usdcChecked}
                                                        usdtChecked={usdtChecked}
                                                        coinsSelectionEnabled={!directOperation}
                                                        selectedCoin={selectedCoin}
                                                        balance={balance}
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
                                                {props.operationName === 'Deposit' && (
                                                    <TransactionHistory
                                                        title="My deposits history"
                                                        items={transactionList}
                                                    />
                                                )}
                                                {props.operationName === 'Withdraw' && (
                                                    <TransactionHistory
                                                        title="My withdrawals history"
                                                        items={transactionList}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    )}
                </Row>
            </Container>
        </React.Fragment>
    );
};
