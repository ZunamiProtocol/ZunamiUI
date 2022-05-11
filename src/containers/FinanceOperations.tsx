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

interface FinanceOperationsProps {
    operationName: string;
}

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
    const [coins, setCoins] = useState([0, 0, 0]);
    const [selectedCoinIndex, setSelectedCoinIndex] = useState(-1);

    const [dai, setDai] = useState('0');
    const [usdc, setUsdc] = useState('0');
    const [usdt, setUsdt] = useState('0');

    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi);
    const lpPrice = useLpPrice();
    const [transactionList, setTransactionList] = useState([]);

    const calculateStables = async (
        coinIndex: number,
        balance: string,
        sharePercent: number,
        zunamiContract: Contract
    ) => {
        if (Number(balance) === 0 || Number(lpPrice) === 0) {
            return '0';
        }

        let result = '';

        const balanceToWithdraw = new BigNumber(balance)
            .multipliedBy(sharePercent / 100)
            .toFixed(0)
            .toString();

        result = await calcWithdrawOneCoin(zunamiContract, balanceToWithdraw, coinIndex);

        return result;
    };

    useEffect(() => {
        if (!zunamiContract || !account || sharePercent < 1 || props.operationName !== 'Withdraw') {
            return;
        }

        const loadBalance = async () => {
            const rawBalance = await getBalanceNew(zunamiContract, account);

            setBalance(
                Number(lpPrice) > 0
                    ? lpPrice.multipliedBy(new BigNumber(rawBalance))
                    : new BigNumber(rawBalance)
            );

            if (Number(rawBalance) === 0) {
                return;
            }

            if (selectedCoinIndex === -1) {
                const oneThird = (getBalanceNumber(new BigNumber(rawBalance)) / 3)
                    .toFixed(2)
                    .toString();

                setDai(oneThird);
                setUsdc(oneThird);
                setUsdt(oneThird);
                return;
            }

            try {
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
                    setDai(
                        getBalanceNumber(new BigNumber(stablesToWithdraw)).toFixed(2).toString()
                    );
                } else if (selectedCoinIndex === 1) {
                    setUsdc(
                        getBalanceNumber(new BigNumber(stablesToWithdraw), 6).toFixed(2).toString()
                    );
                } else if (selectedCoinIndex === 2) {
                    setUsdt(
                        getBalanceNumber(new BigNumber(stablesToWithdraw), 6).toFixed(2).toString()
                    );
                }
            } catch (error: any) {
                console.log(
                    `Error while getting calcWithdrawOneCoin: ${error.message}. Params: lpShares: ${balance}, coinIndex: ${selectedCoinIndex}`
                );
            }
        };

        loadBalance();
    }, [
        coins,
        account,
        zunamiContract,
        selectedCoin,
        sharePercent,
        selectedCoinIndex,
        props.operationName,
        lpPrice,
    ]);

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
