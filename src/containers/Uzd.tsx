import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header/Header';
import './Uzd.scss';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useWallet } from 'use-wallet';
import { InfoBlock } from '../components/InfoBlock/InfoBlock';
import useBalanceOf from '../hooks/useBalanceOf';
import useUzdBalance from '../hooks/useUzdBalance';
import useSushi from '../hooks/useSushi';
import useUzdTotalSupply from '../hooks/useUzdTotalSupply';
import useEagerConnect from '../hooks/useEagerConnect';
import { BIG_TEN, BIG_ZERO, getBalanceNumber, UZD_DECIMALS } from '../utils/formatbalance';
import useUzdLpPrice from '../hooks/useUzdLpPrice';
import BigNumber from 'bignumber.js';
import { getAllowance } from '../utils/erc20';
import { contractAddresses } from '../sushi/lib/constants';
import { approve, getMasterChefContract } from '../sushi/utils';
import { Preloader } from '../components/Preloader/Preloader';
import { log } from '../utils/logger';
import { SideBar, ZunamiInfo, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import { zunamiInfoUrl, curvePoolsApyUrl } from '../api/api';
import useFetch from 'react-fetch-hook';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import { UzdMigrationModal } from '../components/UzdMigrationModal/UzdMigrationModal';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { TransactionHistory } from '../components/TransactionHistory/TransactionHistory';
import { ActionSelector } from '../components/Form/ActionSelector/ActionSelector';

interface CurvePoolInfo {
    apy: number;
    apyFormatted: string;
    apyWeekly: number;
    index: number;
    poolAddress: string;
    poolSymbol: string;
}

export interface CurveInfoFetch {
    data: any;
    isLoading: boolean;
    error: any;
}

function convertZlpToUzd(zlpAmount: BigNumber, lpPrice: BigNumber): BigNumber {
    return zlpAmount.multipliedBy(lpPrice);
}

const getFullDisplayBalance = (balance: BigNumber, decimals = 18, roundDown = false) => {
    const newNumber = new BigNumber(balance);
    return newNumber.dividedBy(BIG_TEN.pow(decimals)).decimalPlaces(2, 1).toString();
};

function convertUzdToZlp(uzdAmount: BigNumber, lpPrice: BigNumber): BigNumber {
    return uzdAmount.dividedBy(lpPrice);
}

function formatUzd(sum: BigNumber) {
    return sum.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).decimalPlaces(2, 1).toString();
}

export const formatBigNumberFull = (balance: BigNumber) => {
    return balance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).decimalPlaces(18, 1).toString();
};

const addToken = async (
    ethereum: any,
    tokenSymbol: string,
    tokenDecimals: Number,
    tokenImage: string
) => {
    const tokenAddress = contractAddresses.uzd[1];

    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress,
                    symbol: tokenSymbol,
                    decimals: tokenDecimals,
                    image: tokenImage,
                },
            },
        });

        if (wasAdded) {
            console.log('Thanks for your interest!');
        } else {
            console.log('Your loss!');
        }
    } catch (error: any) {
        log(`❗️ Error while adding ${tokenSymbol} token: ${error.message}`);
    }
};

export const Uzd = (): JSX.Element => {
    const { account, connect, ethereum, chainId } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);
    const zlpBalance = useBalanceOf(undefined, true);
    const uzdBalance = useUzdBalance();
    const deprecatedUzdBalance = useUzdBalance(contractAddresses.deprecated.v_1_0_uzd);
    const uzdTotalSupply = useUzdTotalSupply();
    const [zunLpValue, setZunLpValue] = useState('');
    const [uzdValue, setUzdValue] = useState('');
    const lpPrice = useUzdLpPrice();
    const [zlpAllowance, setZlpAllowance] = useState(BIG_ZERO);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [mode, setMode] = useState('mint');
    const [ltvValue, setLtvValue] = useState('0');
    const [supportedChain, setSupportedChain] = useState(true);
    const [withdrawAll, setWithdrawAll] = useState(false);
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);
    const hint = 'The new version of UZD v1.2 is coming soon…';

    const {
        isLoading,
        data: zunData,
        error: zunError,
    } = useFetch(zunamiInfoUrl) as ZunamiInfoFetch;

    const zunamiInfo = zunData as ZunamiInfo;

    const { isLoading: isCurveLoading, data: curvePoolData } = useFetch(
        curvePoolsApyUrl
    ) as CurveInfoFetch;

    const uzdCurvePool =
        !isCurveLoading &&
        curvePoolData.data.poolDetails.filter(
            (pool: CurvePoolInfo) => pool.poolAddress === contractAddresses.curve.uzdPool
        )[0];

    useEagerConnect(account ? account : '', connect, ethereum);

    useEffect(() => {
        setSupportedChain(chainId === 1);
    }, [chainId]);

    // GZLP apprival
    useEffect(() => {
        let refreshInterval: NodeJS.Timeout | undefined = undefined;

        if (!account || !ethereum) {
            return;
        }

        const getZlpApprove = async () => {
            const allowance = new BigNumber(
                await getAllowance(
                    ethereum,
                    contractAddresses.zunami[1],
                    sushi.contracts.uzdContract,
                    // @ts-ignore
                    account
                )
            );

            setZlpAllowance(allowance);
        };

        getZlpApprove();

        refreshInterval = setInterval(getZlpApprove, 10000);
        return () => clearInterval(refreshInterval);
    }, [account, ethereum, masterChefContract, sushi?.contracts.uzdContract]);

    // LTV
    useEffect(() => {
        if (uzdTotalSupply.toNumber() > 0 && zunamiInfo) {
            const val =
                (Number(getFullDisplayBalance(uzdTotalSupply)) /
                    Number(getBalanceNumber(zunamiInfo.tvl))) *
                100;
            setLtvValue(val.toFixed(2).toString());
        }
    }, [uzdTotalSupply, zunamiInfo]);

    const depositDisabled =
        Number(zunLpValue) <= 0 ||
        isNaN(Number(zunLpValue)) ||
        pendingTx ||
        parseFloat(zunLpValue) > zlpBalance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).toNumber();

    const withdrawDisabled =
        Number(uzdValue) <= 0 ||
        isNaN(Number(uzdValue)) ||
        pendingTx ||
        parseFloat(uzdValue) > uzdBalance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).toNumber();

    // v1.1 migration modal
    const [showMigrationModal, setShowMigrationModal] = useState(false);

    useEffect(() => {
        if (deprecatedUzdBalance.toNumber() > 0) {
            setShowMigrationModal(true);
        } else {
            setShowMigrationModal(false);
        }
    }, [deprecatedUzdBalance]);

    const [transactionList, setTransactionList] = useState([]);
    const [showMobileTransHistory, setShowMobileTransHistory] = useState(false);
    const [transHistoryPage, setTransHistoryPage] = useState(0);

    return (
        <React.Fragment>
            <MobileSidebar />
            <div className="row main-row h-100 UzdContainer">
                {!supportedChain && (
                    <UnsupportedChain
                        text="You're using unsupported chain. Please, switch to Ethereum network."
                        customNetworksList={[networks[0]]}
                    />
                )}
                <UzdMigrationModal
                    show={showMigrationModal}
                    balance={deprecatedUzdBalance}
                    onHide={() => {
                        setShowMigrationModal(false);
                    }}
                />
                <SideBar isMainPage={false}>
                    <div className="Counter mt-3 ZLPBalance" data-title="ZLP Balance">
                        <div className="Counter__Title d-flex justify-content-between">
                            <span>Total UZD issued</span>
                        </div>
                        <div className="Counter__Value Counter__Value-Big Counter__Value-Active">
                            <div>{getFullDisplayBalance(uzdTotalSupply)}</div>
                        </div>
                        <svg
                            width="59"
                            height="68"
                            viewBox="0 0 59 68"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ZLPBalance__Bg"
                        >
                            <path
                                d="M58.6944 42.5058L57.1198 39.5501C56.9563 39.2435 56.7331 38.9718 56.4632 38.7507C56.1934 38.5296 55.8821 38.3634 55.5472 38.2616C55.2126 38.1583 54.8607 38.1214 54.5117 38.1531C54.1627 38.1848 53.8235 38.2844 53.5135 38.4462L38.8383 46.1078L31.8349 32.96L42.8003 6.7767C42.9749 6.36326 43.0375 5.91188 42.982 5.46716C42.9646 5.08147 42.8617 4.7043 42.6804 4.36244L41.1062 1.40754C40.9429 1.10084 40.7198 0.829148 40.45 0.608084C40.1802 0.387021 39.8689 0.220956 39.534 0.119438C39.1994 0.0162067 38.8475 -0.0206349 38.4985 0.0109711C38.1495 0.0425772 37.8104 0.142008 37.5003 0.303623L19.4574 9.72366L15.8157 2.88738C15.6523 2.58071 15.4291 2.30903 15.1593 2.08792C14.8895 1.8668 14.5784 1.70061 14.2435 1.59887C13.909 1.49517 13.5571 1.45813 13.208 1.48981C12.8589 1.52149 12.5197 1.62127 12.2098 1.78346L9.22496 3.34149C8.91518 3.50341 8.64075 3.72428 8.4174 3.99144C8.19405 4.2586 8.02617 4.56679 7.9234 4.89833C7.81901 5.22952 7.78161 5.57785 7.81354 5.92335C7.84546 6.26885 7.94609 6.60472 8.10945 6.91166L11.7511 13.7468L1.42325 19.1385C1.11349 19.3002 0.838993 19.521 0.615694 19.788C0.392395 20.055 0.224697 20.3631 0.122098 20.6946C0.0175065 21.0258 -0.0198985 21.3743 0.0120308 21.7199C0.0439602 22.0655 0.144596 22.4014 0.308148 22.7083L1.88236 25.6632C2.04573 25.9699 2.26873 26.2416 2.53855 26.4627C2.80837 26.6837 3.11968 26.8498 3.45457 26.9513C3.78912 27.0547 4.14088 27.0916 4.48988 27.06C4.83888 27.0284 5.17824 26.9288 5.4883 26.7671L15.8149 21.3758L22.2196 33.3994L10.6765 60.9621C10.5251 61.3409 10.4587 61.7478 10.482 62.1545C10.5065 62.5618 10.6202 62.9589 10.8152 63.3184C10.8533 63.3878 10.8826 63.4446 10.9126 63.5026L12.5574 66.5924C12.7208 66.8991 12.9437 67.1708 13.2134 67.3918C13.4832 67.6129 13.7944 67.7789 14.1292 67.8805C14.3863 67.9597 14.654 67.9999 14.9232 68C15.3553 67.9996 15.7809 67.8954 16.1634 67.6963L35.1963 57.7595L37.402 61.9005C37.5654 62.2072 37.7884 62.4789 38.0582 62.6999C38.328 62.921 38.6394 63.087 38.9743 63.1886C39.3088 63.2919 39.6606 63.3288 40.0096 63.2972C40.3586 63.2656 40.6979 63.1661 41.008 63.0044L43.9932 61.4459C44.3028 61.284 44.5772 61.0632 44.8004 60.7961C45.0236 60.529 45.1913 60.2209 45.294 59.8895C45.3984 59.5583 45.4356 59.21 45.4036 58.8645C45.3717 58.519 45.2713 58.1831 45.1079 57.8762L42.9026 53.7364L57.5785 46.0748C57.8883 45.913 58.1627 45.6922 58.3861 45.4251C58.6094 45.158 58.7773 44.8499 58.8801 44.5184C58.9845 44.1873 59.0218 43.8392 58.99 43.4938C58.9581 43.1484 58.8577 42.8127 58.6944 42.5058ZM23.5212 17.3527L30.456 13.7325L26.555 23.0473L23.5212 17.3527ZM31.1324 50.1309L22.8287 54.4656L27.4996 43.3116L31.1324 50.1309Z"
                                fill="url(#paint0_linear_120_10407)"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_120_10407"
                                    x1="7.76413"
                                    y1="3.71264"
                                    x2="39.4058"
                                    y2="54.566"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#ABABAB" stopOpacity="0.66" />
                                    <stop offset="0.845106" stopColor="#D9D9D9" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <svg
                            width="66"
                            height="28"
                            viewBox="0 0 66 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ZLPBalance__Logo"
                        >
                            <path
                                d="M16.9902 7.18579V17.1279C16.9902 20.7879 13.6224 23.7556 9.47097 23.7556C6.70171 23.7556 4.45739 21.2825 4.45739 18.232V7.18579H0.000988347V18.2038C-0.00296151 20.6898 0.986109 23.0762 2.75191 24.8411C4.51771 26.6061 6.91655 27.6059 9.42382 27.622C11.2752 27.634 13.1085 27.2595 14.8043 26.5227C15.7556 26.1014 16.5259 25.3599 16.9789 24.4296V27.0614H16.9902V27.0699H21.4465V7.18579H16.9902Z"
                                fill="black"
                            />
                            <path
                                d="M61.3054 0.55957V0.560348H61.2993V9.83687C60.7635 8.91704 59.9425 8.19334 58.9585 7.77346C57.3338 7.03902 55.5718 6.65094 53.7863 6.63433C47.1735 6.63433 41.812 11.3316 41.812 17.1269C41.812 22.9213 46.0507 27.6194 51.2806 27.6194C52.524 27.6195 53.7554 27.3767 54.9042 26.9049C56.053 26.433 57.0969 25.7415 57.9761 24.8697C58.8554 23.9978 59.5528 22.9628 60.0286 21.8237C60.5044 20.6846 60.7492 19.4638 60.7491 18.2309H56.293C56.293 21.2809 54.0489 23.7536 51.2806 23.7536C48.5117 23.7536 46.2677 20.7864 46.2677 17.1269C46.2677 13.4674 49.635 10.5002 53.7863 10.5002C57.9391 10.5002 61.3058 13.4675 61.3058 17.1269V27.0675H65.7615V0.55957H61.3054Z"
                                fill="black"
                            />
                            <path
                                d="M23.3574 9.3257V11.0854H35.4494L23.3574 23.0059V26.9908H41.7245V23.0059H40.62V23.0055H30.0311L30.6919 22.2518C30.7353 22.2066 30.7781 22.1609 30.8196 22.1139L32.0145 20.76L41.7245 10.9013V7.19019H23.3574V9.3257Z"
                                fill="black"
                            />
                        </svg>
                    </div>
                    <div className="Uzd-Zlp-Balances mt-3">
                        <div className="title">Your UZD & ZLP Balances</div>
                        <div className="Counters d-flex mt-3">
                            <div className="Counter">
                                <div className="Counter__Title d-flex justify-content-between">
                                    <span>UZD Balance</span>
                                    <div className="Counter__Title__Buttons">
                                        <div
                                            onClick={async () => {
                                                navigator.clipboard
                                                    .writeText(contractAddresses.uzd[1])
                                                    .then(function () {
                                                        alert(
                                                            'UZD address copied to the clipboard'
                                                        );
                                                    });
                                            }}
                                        >
                                            <img src="/copy-icon.svg" alt="Copy token address" />
                                        </div>
                                        <div
                                            onClick={async () => {
                                                addToken(
                                                    ethereum,
                                                    'UZD',
                                                    UZD_DECIMALS,
                                                    'https://app.zunami.io/uzd-token.png'
                                                );
                                            }}
                                        >
                                            <img
                                                src="/metamask-icon.svg"
                                                alt="Add token to Metamask"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="Counter__Value Counter__Value-Big Counter__Value-Active">
                                    {formatUzd(uzdBalance)}
                                </div>
                            </div>

                            <div className="Counter" data-title="ZLP Balance">
                                <div className="Counter__Title d-flex justify-content-between">
                                    <span>ZLP Balance</span>
                                    <div className="Counter__Title__Buttons">
                                        <div
                                            onClick={async () => {
                                                navigator.clipboard
                                                    .writeText(contractAddresses.zunami[1])
                                                    .then(function () {
                                                        alert(
                                                            'ZLP address copied to the clipboard'
                                                        );
                                                    });
                                            }}
                                        >
                                            <img src="/copy-icon.svg" alt="Copy token address" />
                                        </div>
                                        <div
                                            onClick={async () => {
                                                addToken(
                                                    ethereum,
                                                    'ZLP',
                                                    UZD_DECIMALS,
                                                    'https://app.zunami.io/zlp-token.jpg'
                                                );
                                            }}
                                        >
                                            <img
                                                src="/metamask-icon.svg"
                                                alt="Add token to Metamask"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="Counter__Value Counter__Value-Big Counter__Value-Active">
                                    <div>{getFullDisplayBalance(zlpBalance)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                    <div className="UzdContainer__Actions">
                        <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
                            {transactionError && (
                                <Toast
                                    onClose={() => setTransactionError(undefined)}
                                    delay={5000}
                                    autohide
                                >
                                    <Toast.Body>
                                        Sorry, we couldn't complete the transaction
                                    </Toast.Body>
                                </Toast>
                            )}
                            {transactionId && (
                                <Toast
                                    onClose={() => setTransactionId(undefined)}
                                    delay={15000}
                                    autohide
                                >
                                    <Toast.Body>
                                        Success! Check out the{' '}
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={`https://etherscan.io/tx/${transactionId}`}
                                        >
                                            transaction
                                        </a>
                                    </Toast.Body>
                                </Toast>
                            )}
                        </ToastContainer>
                        <div className="UzdContainer__Actions_Inner">
                            <div className="InfoBars">
                                <div className="card InfoBar">
                                    <div className="card-body">
                                        <div className="title">Info bar</div>
                                        <div className="values">
                                            <div className="block">
                                                <div>
                                                    <span className="name">APY</span>
                                                    <span className="value">
                                                        {`${
                                                            zunamiInfo && !zunError
                                                                ? `${zunamiInfo.apy.toFixed(2)}%`
                                                                : 'n/a'
                                                        }`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="block">
                                                <div>
                                                    <span className="name">LTV</span>
                                                    <span className="value">{`${ltvValue}%`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card InfoBar flex-fill CurveWarning">
                                    <div className="card-body">
                                        <div className="title">Important</div>
                                        <div className="text">
                                            Protocol Takes no redemption fee. It will be cheaper and
                                            easier to withdraw using the Curve pool
                                        </div>
                                        <a
                                            href="https://curve.exchange/#/ethereum/pools/factory-v2-218/swap"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="zun-button"
                                        >
                                            Go to Curve
                                        </a>
                                        <svg
                                            className="bg"
                                            width="48"
                                            height="125"
                                            viewBox="0 0 48 125"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M43.6204 21.0414H22.073L26.2774 0H48L43.6204 21.0414ZM22.073 125H0L19.2701 32.9886H41.3431L22.073 125Z"
                                                fill="url(#paint0_linear_120_10363)"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_120_10363"
                                                    x1="0.701416"
                                                    y1="113.653"
                                                    x2="72.7694"
                                                    y2="-25.5357"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#F7F7F7" />
                                                    <stop offset="1" stopColor="#D9D9D9" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="mint-redeem-inputs">
                                <ActionSelector
                                    value={mode}
                                    actions={[
                                        {
                                            name: 'mint',
                                            title: 'Mint',
                                        },
                                        {
                                            name: 'redeem',
                                            title: 'Redeem',
                                        },
                                    ]}
                                    onChange={(action: string) => {
                                        setMode(action);
                                    }}
                                />
                                <div className={`inputs ${mode === 'redeem' ? 'redeem' : 'mint'}`}>
                                    <div className="s-coin">
                                        <div className="left-part">
                                            <div className="action">
                                                I {mode === 'mint' ? 'send' : 'receive'}
                                            </div>
                                            <div className="coin">Zunami LP</div>
                                        </div>
                                        <div className="right-part">
                                            <input
                                                type="text"
                                                value={zunLpValue.toString()}
                                                max={getFullDisplayBalance(zlpBalance)}
                                                onChange={(e) => {
                                                    const inputVal = e.nativeEvent.target.value;

                                                    if (inputVal === '') {
                                                        setZunLpValue(inputVal);
                                                        setUzdValue('0');
                                                    }

                                                    const invalid =
                                                        Number(inputVal) <= 0 || isNaN(inputVal);

                                                    if (invalid) {
                                                        return;
                                                    }

                                                    setZunLpValue(inputVal);

                                                    setUzdValue(
                                                        convertZlpToUzd(
                                                            new BigNumber(inputVal),
                                                            lpPrice
                                                        )
                                                            .toFixed(2, 1)
                                                            .toString()
                                                    );
                                                }}
                                            />
                                            {mode === 'mint' && (
                                                <div
                                                    className="max"
                                                    onClick={() => {
                                                        setZunLpValue(
                                                            formatBigNumberFull(zlpBalance)
                                                        );

                                                        const uzdToRedeem = convertZlpToUzd(
                                                            zlpBalance,
                                                            lpPrice
                                                        );

                                                        log(
                                                            `For ${getFullDisplayBalance(
                                                                zlpBalance
                                                            )} ZLP you'll receive ${getFullDisplayBalance(
                                                                uzdToRedeem
                                                            )}. LP price: ${getFullDisplayBalance(
                                                                lpPrice
                                                            )}`
                                                        );

                                                        setUzdValue(
                                                            formatBigNumberFull(uzdToRedeem)
                                                        );
                                                    }}
                                                >
                                                    max
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="swap"
                                        onClick={() => {
                                            if (mode === 'mint') {
                                                setMode('redeem');
                                                setUzdValue(formatUzd(uzdBalance));
                                                const zlpVal = getFullDisplayBalance(
                                                    uzdBalance.dividedBy(lpPrice)
                                                );
                                                setZunLpValue(zlpVal);
                                            } else {
                                                setMode('mint');
                                            }
                                        }}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M4.28037 0.58202L0.390323 4.0996C-0.416103 4.82881 0.110389 6.14877 1.20767 6.14877L3.28422 6.14877L3.28422 13.8985C3.28422 14.0928 3.32326 14.2851 3.39911 14.4646C3.47497 14.644 3.58615 14.8071 3.72631 14.9444C3.86647 15.0818 4.03286 15.1907 4.21598 15.2651C4.39911 15.3394 4.59539 15.3777 4.7936 15.3777C4.99182 15.3777 5.18809 15.3394 5.37122 15.2651C5.55434 15.1907 5.72073 15.0818 5.86089 14.9444C6.00105 14.8071 6.11223 14.644 6.18809 14.4646C6.26394 14.2851 6.30298 14.0928 6.30298 13.8985L6.30298 1.45006C6.30298 0.420509 5.05248 -0.116167 4.28037 0.58202Z"
                                                fill="#ADADAD"
                                            />
                                            <path
                                                d="M11.7196 15.0625L15.6096 11.5449C16.416 10.8157 15.8895 9.49576 14.7923 9.49576L12.7157 9.49576L12.7157 1.74601C12.7157 1.55177 12.6767 1.35943 12.6008 1.17997C12.525 1.00051 12.4138 0.837455 12.2736 0.700104C12.1335 0.562753 11.9671 0.453798 11.784 0.379465C11.6008 0.305131 11.4046 0.266873 11.2063 0.266874C11.0081 0.266874 10.8118 0.305131 10.6287 0.379465C10.4456 0.453798 10.2792 0.562753 10.139 0.700104C9.99889 0.837455 9.8877 1.00051 9.81185 1.17997C9.736 1.35943 9.69696 1.55177 9.69696 1.74601L9.69696 14.1945C9.69696 15.224 10.9475 15.7607 11.7196 15.0625Z"
                                                fill="url(#paint0_linear_71_28360)"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_71_28360"
                                                    x1="10.9091"
                                                    y1="1.15568"
                                                    x2="12.7273"
                                                    y2="15.095"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#F95403" />
                                                    <stop offset="1" stopColor="#FB9A11" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span>Tap to {mode === 'mint' ? 'Redeem' : 'Mint'}</span>
                                    </div>
                                    <div className="s-coin">
                                        <div className="left-part">
                                            <div className="action">
                                                I {mode !== 'mint' ? 'send' : 'receive'}
                                            </div>
                                            <div className="coin">
                                                <span>UZD COIN</span>
                                            </div>
                                        </div>
                                        <div className="right-part">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={uzdValue}
                                                    onChange={(e) => {
                                                        const inputVal = e.nativeEvent.target.value;

                                                        setUzdValue(inputVal);
                                                        setWithdrawAll(false);

                                                        if (
                                                            Number(inputVal) <= 0 ||
                                                            isNaN(inputVal)
                                                        ) {
                                                            return;
                                                        }

                                                        if (mode === 'mint') {
                                                            setZunLpValue(
                                                                convertUzdToZlp(
                                                                    new BigNumber(inputVal),
                                                                    lpPrice
                                                                )
                                                                    .toFixed(2)
                                                                    .toString()
                                                            );
                                                        } else {
                                                            setZunLpValue(
                                                                convertUzdToZlp(
                                                                    new BigNumber(inputVal),
                                                                    lpPrice
                                                                )
                                                                    .toFixed(2)
                                                                    .toString()
                                                            );
                                                        }
                                                    }}
                                                />
                                                {mode === 'redeem' && (
                                                    <div
                                                        className="max"
                                                        onClick={() => {
                                                            setUzdValue(
                                                                formatBigNumberFull(uzdBalance)
                                                            );

                                                            setZunLpValue(
                                                                convertUzdToZlp(
                                                                    uzdBalance.dividedBy(
                                                                        BIG_TEN.pow(UZD_DECIMALS)
                                                                    ),
                                                                    lpPrice
                                                                )
                                                                    .toFixed()
                                                                    .toString()
                                                            );

                                                            setWithdrawAll(true);
                                                        }}
                                                    >
                                                        max
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    {zlpAllowance.toNumber() === 0 && mode === 'mint' && (
                                        <div>
                                            <input
                                                type="button"
                                                className={`zun-button ${
                                                    pendingTx ? 'disabled' : ''
                                                }`}
                                                value="Approve ZLP"
                                                onClick={async () => {
                                                    setPendingTx(true);

                                                    try {
                                                        await approve(
                                                            ethereum,
                                                            contractAddresses.zunami[1],
                                                            sushi.contracts.uzdContract,
                                                            account
                                                        );

                                                        log('ZLP approved');
                                                    } catch (error: any) {
                                                        log(
                                                            `❗️ Error while approving ZLP: ${error.message}`
                                                        );
                                                    }

                                                    setPendingTx(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                    {zlpAllowance.toNumber() > 0 && mode === 'mint' && (
                                        <div ref={target} onClick={() => setShowHint(!showHint)}>
                                            <OverlayTrigger
                                                placement="right"
                                                overlay={<Tooltip>{hint}</Tooltip>}
                                            >
                                                <input
                                                    type="button"
                                                    className="zun-button"
                                                    style={{ opacity: 0.5 }}
                                                    value="Mint"
                                                />
                                            </OverlayTrigger>
                                        </div>
                                    )}
                                    {zlpAllowance.toNumber() > 0 && mode === 'redeem' && (
                                        <input
                                            type="button"
                                            className={`zun-button ${
                                                withdrawDisabled ? 'disabled' : ''
                                            }`}
                                            value="Redeem"
                                            onClick={async () => {
                                                setPendingTx(true);
                                                let tx = null;

                                                try {
                                                    if (withdrawAll) {
                                                        log('UZD contract (ETH): withdrawAll()');

                                                        tx =
                                                            await sushi.contracts.uzdContract.methods
                                                                .withdrawAll(account, account)
                                                                .send({
                                                                    from: account,
                                                                });
                                                    } else {
                                                        const sumToWithdraw = new BigNumber(
                                                            uzdValue
                                                        )
                                                            .multipliedBy(BIG_TEN.pow(UZD_DECIMALS))
                                                            .toString();

                                                        log(
                                                            `UZD contract (ETH): withdraw('${new BigNumber(
                                                                uzdValue
                                                            )
                                                                .multipliedBy(
                                                                    BIG_TEN.pow(UZD_DECIMALS)
                                                                )
                                                                .toString()}', '${account}', '${account}'')`
                                                        );

                                                        tx =
                                                            await sushi.contracts.uzdContract.methods
                                                                .withdraw(
                                                                    sumToWithdraw,
                                                                    account,
                                                                    account
                                                                )
                                                                .send({
                                                                    from: account,
                                                                });
                                                    }

                                                    setTransactionId(tx.transactionHash);
                                                } catch (error: any) {
                                                    setTransactionError(true);
                                                    log(
                                                        `❗️ Error while redeeming ZLP: ${error.message}`
                                                    );
                                                }

                                                setPendingTx(false);
                                            }}
                                        />
                                    )}

                                    {pendingTx && <Preloader className="ms-2" />}
                                </div>
                            </div>
                            <div className={`flex-fill card mint-card`}>
                                <div className="card-body">
                                    <div className="title d-flex align-items-center">
                                        <img src="/curve-icon.svg" alt="" />
                                        <div>
                                            <div className="ms-3">Boost your APY on Curve</div>
                                        </div>
                                    </div>
                                    <div className="curve-boost">
                                        <div className="d-flex align-items-center justify-content-between mt-4">
                                            <div className="Counter">
                                                <div className="Counter__Title">Curve APY</div>
                                                <div className="Counter__Value Counter__Value-Active">
                                                    {uzdCurvePool.apyFormatted} /{' '}
                                                    {isLoading
                                                        ? 'n/a'
                                                        : `${zunamiInfo.curve.uzdRewardApr.toFixed(
                                                              2
                                                          )}%`}
                                                </div>
                                            </div>
                                            <a
                                                href="https://curve.exchange/#/ethereum/pools/factory-v2-218/deposit"
                                                className="zun-button"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <span>Go to Curve</span>
                                            </a>
                                        </div>
                                        {/* <div className="pool-percent">
                                                <div className="inner">
                                                    <div className="title">Curve APY / Extra Reward APR</div>
                                                </div>
                                                <div className="percent">
                                                    {uzdCurvePool.apyFormatted} / {isLoading ? 'n/a' : `${zunamiInfo.curve.uzdRewardApr.toFixed(2)}%`}
                                                </div>
                                            </div> */}
                                    </div>
                                    <h2 className="how-it-works">How it works?</h2>
                                    <ul>
                                        <li>
                                            <div className="counter">1</div>
                                            <span>
                                                Make a deposit in the Zunami Protocol and get LP
                                                tokens
                                            </span>
                                        </li>
                                        <li>
                                            <div className="counter">2</div>
                                            <span>
                                                Issue UZD tokens instead of your Zunami LP tokens
                                            </span>
                                        </li>
                                        <li>
                                            <div className="counter">3</div>
                                            <span>
                                                Deposit liquidity in liquidity pool on Curve
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* <div>
                                        <div className="d-flex protocol_fee">
                                            <div>
                                                <svg
                                                    width="36"
                                                    height="35"
                                                    viewBox="0 0 36 35"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M17.4498 1.1791e-05C27.1429 -0.0111169 35.0164 7.85685 35.0053 17.5499C34.9942 27.2263 27.1207 35.0609 17.3664 34.9996C7.73453 34.9384 0.0334921 27.1818 0.000106157 17.5555C-0.0332798 7.87354 7.81243 0.0111405 17.4498 1.1791e-05ZM12.1025 28.0331C12.097 28.0665 12.0914 28.1054 12.0914 28.1444C12.1526 29.274 12.9038 30.0474 14.0333 30.0808C14.3449 30.0919 14.6621 30.0585 14.9626 29.9862C17.5389 29.3964 19.6478 27.9163 21.7177 26.3749C22.0015 26.1635 22.0404 25.8519 21.9403 25.5292C21.7344 24.8893 21.1167 24.611 20.4657 24.906C19.9093 25.1619 19.3862 25.4679 18.8354 25.7295H18.8298C18.5182 25.8741 18.1788 25.5792 18.2678 25.2509C18.2678 25.2454 18.2678 25.2454 18.2678 25.2398C19.3417 21.5284 20.4268 17.817 21.5118 14.1112C21.8568 12.9315 21.2503 12.019 20.0317 11.8965C19.9148 11.8854 19.7924 11.891 19.6756 11.8965C18.329 11.9578 17.0715 12.325 15.8696 12.926C14.7456 13.4879 13.7329 14.2224 12.7814 15.0404C12.4475 15.3242 12.2973 15.7137 12.4253 16.1254C12.5477 16.5094 12.9316 16.5873 13.2933 16.6429C13.6717 16.6986 13.9888 16.5428 14.3171 16.387C14.651 16.2256 14.9848 16.0531 15.3298 15.9307C15.6247 15.8305 15.7082 15.9251 15.6414 16.2256C15.6136 16.3536 15.5747 16.4816 15.5357 16.6095C14.4507 20.1651 13.3601 23.7152 12.275 27.2708C12.2082 27.5156 12.1582 27.7771 12.1025 28.0331ZM19.5643 8.09611C19.5643 8.08498 19.5643 8.07385 19.5643 8.06273C19.5476 6.71059 19.1414 5.77579 18.0842 5.21935C16.7042 4.49043 15.0961 5.21379 14.7011 6.72172C14.5008 7.48404 14.5174 8.24635 14.7122 9.01423C14.957 9.99355 15.5635 10.6168 16.554 10.7837C17.5556 10.9506 18.418 10.6334 19.0079 9.77098C19.3862 9.20898 19.5365 8.56908 19.5643 8.09611Z"
                                                        fill="#D5D5D5"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="protocol_fee__text">
                                                Protocol Takes no redemption fee. It will be
                                                cheaper and easier to withdraw using the Curve
                                                pool
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <a
                                                href="https://curve.exchange/#/ethereum/pools/factory-v2-218/swap"
                                                className="go-to-curve ms-auto me-auto"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img src="/curve-icon.svg" alt="" />
                                                <span>Go to Curve</span>
                                            </a>
                                        </div>
                                    </div>
                                 */}
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
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
