import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { SideBar } from '../components/SideBar/SideBar';
import { Form } from '../components/Form/Form';
import './FinanceOperations.scss';
import { Container, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { useWallet } from 'use-wallet';
import useEagerConnect from '../hooks/useEagerConnect';
import { WelcomeCarousel } from '../components/WelcomeCarousel/WelcomeCarousel';
import { WithdrawOptions } from '../components/Form/WithdrawOptions/WithdrawOptions';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
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
    zunamiContract: Contract,
    setError: Function
) => {
    if (!zunamiContract || coinIndex === -1 || balance.toNumber() === 0) {
        return '0';
    }

    let result = '';

    const balanceToWithdraw = balance
        .multipliedBy(sharePercent / 100)
        .toFixed(0)
        .toString();

    setError('');

    try {
        result = await calcWithdrawOneCoin(zunamiContract, balanceToWithdraw, coinIndex);
    } catch (error: any) {
        setError(
            `Error: ${error.message}. Params - coinIndex: ${coinIndex}, lpShares: ${balanceToWithdraw}`
        );
        return error;
    }

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
    const [calcError, setCalcError] = useState('');
    const [transactionList, setTransactionList] = useState([]);
    const [showMobileTransHistory, setShowMobileTransHistory] = useState(false);

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
                zunamiContract,
                setCalcError
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
    }, [balance, selectedCoinIndex, sharePercent, zunamiContract, rawBalance, account]);

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
            <MobileSidebar />
            <Container className={'h-100 d-flex justify-content-between flex-column'}>
                <Row className={'h-100 main-row'}>
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
                                    <Toast onClose={() => setCalcError('')} delay={10000} autohide>
                                        <Toast.Body>{calcError}</Toast.Body>
                                    </Toast>
                                )}
                            </ToastContainer>
                            <Row className={'zun-rounded zun-shadow h-100 operation-col'}>
                                <Col className={'ps-0 pe-0'}>
                                    <div className={'DepositBlock'}>
                                        <div className={'DepositContent'}>
                                            <h3 className="DepositContent__Title">
                                                <FinIcon />
                                                Deposit & Withdraw
                                            </h3>
                                            <div
                                                id="trans-story-mobile-btn"
                                                className={showMobileTransHistory ? 'active' : ''}
                                            >
                                                <svg
                                                    width="11"
                                                    height="12"
                                                    viewBox="0 0 11 12"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M10.6236 11.0138L10.6235 11.0138C10.5976 11.2374 10.4136 11.3805 10.1869 11.3902C10.1667 11.391 10.1459 11.3909 10.1279 11.3909C10.123 11.3908 10.1183 11.3908 10.114 11.3908L2.49809 11.3911C2.49809 11.3911 2.49808 11.3911 2.49807 11.3911C1.96381 11.3913 1.52468 11.2042 1.19989 10.8133C1.0116 10.5867 0.920792 10.3272 0.903542 10.0497C0.901005 10.009 0.900685 9.9687 0.900683 9.93081C0.900571 7.33663 0.900343 4.74246 0.9 2.14829L10.6236 11.0138ZM10.6236 11.0138L10.6239 11.0102M10.6236 11.0138L10.6239 11.0102M10.6239 11.0102C10.6274 10.9661 10.6284 10.9218 10.6269 10.8776L10.627 6.04986L10.6269 1.19128C10.6283 1.15043 10.6273 1.10954 10.6239 1.06878L10.624 1.06878M10.6239 11.0102L10.624 1.06878M10.624 1.06878L10.6236 1.06535M10.624 1.06878L10.6236 1.06535M10.6236 1.06535C10.5976 0.84203 10.4137 0.698423 10.1869 0.689019C10.159 0.687865 10.1302 0.688044 10.1043 0.688205C10.0957 0.688258 10.0874 0.688309 10.0797 0.688309L2.54395 0.688324C2.53469 0.688324 2.52518 0.68829 2.51546 0.688254C2.47938 0.688122 2.44056 0.68798 2.40235 0.689581C1.93356 0.709233 1.54287 0.882505 1.24394 1.21359C0.996923 1.48718 0.899867 1.80616 0.9 2.14826L10.6236 1.06535ZM2.61757 8.5966C2.33832 8.59635 2.05604 8.61933 1.78983 8.73226L1.7898 2.15232C1.7898 1.99286 1.82418 1.85564 1.92744 1.73816C2.05563 1.59232 2.22521 1.51791 2.43986 1.50615C2.46633 1.5047 2.49228 1.50482 2.52151 1.50495C2.5303 1.50499 2.53939 1.50503 2.54887 1.50503L9.69493 1.50498H9.72903L9.72902 8.59777H9.72874H9.72845H9.72817H9.72789H9.7276H9.72732H9.72704H9.72675H9.72647H9.72618H9.7259H9.72562H9.72533H9.72505H9.72477H9.72448H9.7242H9.72392H9.72363H9.72335H9.72306H9.72278H9.7225H9.72221H9.72193H9.72165H9.72136H9.72108H9.72079H9.72051H9.72023H9.71994H9.71966H9.71938H9.71909H9.71881H9.71853H9.71824H9.71796H9.71768H9.71739H9.71711H9.71682H9.71654H9.71626H9.71597H9.71569H9.71541H9.71512H9.71484H9.71456H9.71427H9.71399H9.71371H9.71342H9.71314H9.71285H9.71257H9.71229H9.712H9.71172H9.71144H9.71115H9.71087H9.71059H9.7103H9.71002H9.70973H9.70945H9.70917H9.70888H9.7086H9.70832H9.70803H9.70775H9.70747H9.70718H9.7069H9.70662H9.70633H9.70605H9.70577H9.70548H9.7052H9.70492H9.70463H9.70435H9.70406H9.70378H9.7035H9.70321H9.70293H9.70265H9.70236H9.70208H9.7018H9.70151H9.70123H9.70095H9.70066H9.70038H9.7001H9.69981H9.69953H9.69925H9.69896H9.69868H9.69839H9.69811H9.69783H9.69754H9.69726H9.69698H9.69669H9.69641H9.69613H9.69584H9.69556H9.69528H9.69499H9.69471H9.69443H9.69414H9.69386H9.69358H9.69329H9.69301H9.69273H9.69244H9.69216H9.69187H9.69159H9.69131H9.69102H9.69074H9.69046H9.69017H9.68989H9.68961H9.68932H9.68904H9.68876H9.68847H9.68819H9.68791H9.68762H9.68734H9.68706H9.68677H9.68649H9.68621H9.68592H9.68564H9.68536H9.68507H9.68479H9.68451H9.68422H9.68394H9.68365H9.68337H9.68331C7.32806 8.59912 4.97282 8.59873 2.61757 8.5966ZM9.68885 9.4155H9.73194V10.5738C9.72634 10.5739 9.72074 10.574 9.71504 10.574C7.31369 10.5738 4.91235 10.574 2.51101 10.5744C2.20736 10.5744 1.99072 10.4707 1.85943 10.2416C1.66543 9.90292 1.92332 9.451 2.38845 9.4209C2.44314 9.41736 2.49831 9.41574 2.55357 9.41574L9.68885 9.4155Z"
                                                        fill="#808080"
                                                        stroke="#808080"
                                                        strokeWidth="0.2"
                                                    />
                                                </svg>
                                                <span
                                                    onClick={() => {
                                                        setShowMobileTransHistory(
                                                            !showMobileTransHistory
                                                        );

                                                        document.body.classList.toggle('overflow');
                                                    }}
                                                >
                                                    Transaction Story
                                                </span>
                                            </div>
                                            <div
                                                id="trans-history-mobile"
                                                className={`TransactionHisoryMobile ${
                                                    showMobileTransHistory ? 'active' : ''
                                                }`}
                                            >
                                                <div className="TransactionHisoryMobile__Title">
                                                    {props.operationName === 'Withdraw'
                                                        ? 'My withdrawals'
                                                        : 'My deposits'}
                                                </div>
                                                <div className="TransactionHisoryMobile__Content">
                                                    <TransactionHistory
                                                        title=""
                                                        items={transactionList}
                                                    />
                                                </div>
                                            </div>

                                            {!showMobileTransHistory && (
                                                <div className="flex-wrap d-flex justify-content-start">
                                                    <Form
                                                        operationName={props.operationName}
                                                        daiDisabled={daiDisabled}
                                                        usdcDisabled={usdcDisabled}
                                                        usdtDisabled={usdtDisabled}
                                                        directOperation={directOperation}
                                                        directOperationDisabled={false}
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
                                                                setDai(
                                                                    Number(coinValue).toString()
                                                                );
                                                            } else if (coinType === 'usdc') {
                                                                setUsdc(
                                                                    Number(coinValue).toString()
                                                                );
                                                            } else {
                                                                setUsdt(
                                                                    Number(coinValue).toString()
                                                                );
                                                            }
                                                        }}
                                                        onOperationModeChange={(direct: any) => {
                                                            setDirectOperation(!direct);

                                                            if (
                                                                direct &&
                                                                props.operationName === 'Withdraw'
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

                                                                const coins = [
                                                                    'dai',
                                                                    'usdc',
                                                                    'usdt',
                                                                ];

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
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    )}
                </Row>
                <footer>
                    <div className="mobile">
                        <a href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing">
                            How to use?
                        </a>
                        <a href="https://www.zunami.io/#faq-main" target="_blank" rel="noreferrer">
                            FAQ
                        </a>
                    </div>
                    <span className="copyright">© 2022 Zunami Protocol. Beta version 1.1</span>
                </footer>
            </Container>
        </React.Fragment>
    );
};
