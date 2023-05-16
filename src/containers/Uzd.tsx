import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import './Uzd.scss';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useWallet } from 'use-wallet';
import useBalanceOf from '../hooks/useBalanceOf';
import useUzdBalance from '../hooks/useUzdBalance';
import useSushi from '../hooks/useSushi';
import useUzdTotalSupply from '../hooks/useUzdTotalSupply';
import useEagerConnect from '../hooks/useEagerConnect';
import { BIG_TEN, BIG_ZERO, getBalanceNumber, UZD_DECIMALS } from '../utils/formatbalance';
import useUzdLpPrice from '../hooks/useUzdLpPrice';
import BigNumber from 'bignumber.js';
import { getAllowance, getUzdAllowance } from '../utils/erc20';
import { contractAddresses } from '../sushi/lib/constants';
import { approve, APPROVE_SUM, getMasterChefContract } from '../sushi/utils';
import { Preloader } from '../components/Preloader/Preloader';
import { log } from '../utils/logger';
import { SideBar, ZunamiInfo, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import { zunamiInfoUrl, curvePoolsApyUrl, getTransHistoryUrl } from '../api/api';
import useFetch from 'react-fetch-hook';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import { UzdMigrationModal } from '../components/UzdMigrationModal/UzdMigrationModal';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { TransactionHistory } from '../components/TransactionHistory/TransactionHistory';
import { ActionSelector } from '../components/Form/ActionSelector/ActionSelector';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SupportersBar } from '../components/SupportersBar/SupportersBar';
import { WalletStatus } from '../components/WalletStatus_Analytics/WalletStatus';

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

interface iHistoryTransaction {
    chain: string;
    contractAddress: string;
    dateTime: string;
    transactionHash: string;
    value: number;
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
    // const account = '0xe9b2b067ee106a6e518fb0552f3296d22b82b32b';
    const { account, connect, ethereum, chainId } = useWallet();
    const sushi = useSushi();
    const masterChefContract = getMasterChefContract(sushi);
    const zlpBalance = useBalanceOf(undefined, true);
    const uzdBalance = useUzdBalance();
    const deprecatedUzdBalance = useUzdBalance(contractAddresses.deprecated.v_1_1_uzd);
    const uzdTotalSupply = useUzdTotalSupply();
    const [zunLpValue, setZunLpValue] = useState('');
    const [uzdValue, setUzdValue] = useState('');
    const lpPrice = useUzdLpPrice();
    const [zlpAllowance, setZlpAllowance] = useState(BIG_ZERO);
    const [uzdAllowance, setUzdAllowance] = useState(BIG_ZERO);
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [mode, setMode] = useState('mint');
    const [ltvValue, setLtvValue] = useState('0');
    const [supportedChain, setSupportedChain] = useState(true);
    const [withdrawAll, setWithdrawAll] = useState(false);
    const [hideMigrationModal, setHideMigrationModal] = useState(false);

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
                // await getUzdAllowance(
                await getAllowance(
                    ethereum,
                    contractAddresses.zunami[1],
                    sushi.contracts.uzdContract,
                    // @ts-ignore
                    account
                )
            );

            setZlpAllowance(allowance);

            const uzdAllowance = new BigNumber(
                await getAllowance(
                    ethereum,
                    contractAddresses.uzd[1],
                    sushi.contracts.uzdContract,
                    // @ts-ignore
                    account
                )
            );

            setUzdAllowance(uzdAllowance);
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
        if (deprecatedUzdBalance.dividedBy(BIG_TEN.pow(UZD_DECIMALS)).toNumber() >= 1) {
            setShowMigrationModal(true);
        } else {
            setShowMigrationModal(false);
        }
    }, [deprecatedUzdBalance]);

    const [transactionList, setTransactionList] = useState([]);
    const [showMobileTransHistory, setShowMobileTransHistory] = useState(false);
    const [transHistoryPage, setTransHistoryPage] = useState(0);

    useEffect(() => {
        if (!account || transHistoryPage === -1) {
            return;
        }

        const getTransactionHistory = async () => {
            try {
                let mintResponse = await fetch(
                    getTransHistoryUrl(account, 'MINT', transHistoryPage, 100, chainId, 'UZD')
                );

                let redeemResponse = await fetch(
                    getTransHistoryUrl(account, 'REDEEM', transHistoryPage, 100, chainId, 'UZD')
                );

                let mintData = await mintResponse.json();
                let redeemData = await redeemResponse.json();

                mintData = mintData.uzdTransfers.map((item: any) => {
                    return {
                        ...item,
                        type: 'MINT',
                        status: 'COMPLETED',
                    };
                });

                redeemData = redeemData.uzdTransfers.map((item: any) => {
                    return {
                        ...item,
                        type: 'REDEEM',
                        status: 'COMPLETED',
                    };
                });

                const data = mintData.concat(redeemData);

                if (!data.length) {
                    setTransHistoryPage(-1);
                    return;
                }

                setTransactionList(
                    transactionList
                        .concat(data)
                        .sort((a: iHistoryTransaction, b: iHistoryTransaction | undefined) => {
                            if (!b) {
                                return 0;
                            }

                            return new Date(a.dateTime).getTime() > new Date(b.dateTime).getTime()
                                ? -1
                                : 1;
                        })
                );
            } catch (error) {
                setTransactionList([]);
            }
        };

        getTransactionHistory();
    }, [account, transHistoryPage, chainId]);

    return (
        <React.Fragment>
            <MobileSidebar />
            <AllServicesPanel />
            <div className="container">
                <div className="row main-row h-100 UzdContainer">
                    {!supportedChain && (
                        <UnsupportedChain
                            text="You're using unsupported chain. Please, switch to Ethereum network."
                            customNetworksList={[networks[0]]}
                        />
                    )}
                    <UzdMigrationModal
                        show={showMigrationModal && !hideMigrationModal}
                        balance={deprecatedUzdBalance}
                        onHide={() => {
                            setShowMigrationModal(false);
                            setHideMigrationModal(true);
                        }}
                    />
                    <SideBar isMainPage={false}>
                        {/* <WalletStatus /> */}
                        <div className="mobile-menu-title d-block d-lg-none">Menu</div>
                        <div
                            className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                            style={{
                                fontSize: '13px',
                                overflowX: 'scroll',
                            }}
                        >
                            <a
                                href="/"
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
                                className="text-center d-flex flex-column text-decoration-none selected"
                            >
                                <img src="/uzd.png" alt="" />
                                <span className="text-muted mt-2">UZD</span>
                            </a>
                            <a
                                href="/analytics"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/analytics.png" alt="" />
                                <span className="text-muted mt-2">Analytics</span>
                            </a>
                            <a
                                href="https://snapshot.org/#/zunamidao.eth"
                                className="text-center d-flex flex-column text-decoration-none"
                            >
                                <img src="/dao.png" alt="" />
                                <span className="text-muted mt-2">DAO</span>
                            </a>
                        </div>
                        <div className="Counter mt-3 ZLPBalance" data-title="ZLP Balance">
                            <div className="Counter__Title d-flex justify-content-between">
                                <span>Total UZD issued</span>
                            </div>
                            <div className="Counter__Value Counter__Value-Big Counter__Value-Active">
                                <div className="vela-sans">
                                    {Number(getFullDisplayBalance(uzdTotalSupply)).toLocaleString(
                                        'en',
                                        {
                                            maximumFractionDigits: 0,
                                        }
                                    )}
                                </div>
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
                                        <stop
                                            offset="0.845106"
                                            stopColor="#D9D9D9"
                                            stopOpacity="0"
                                        />
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
                                                <img
                                                    src="/copy-icon.svg"
                                                    alt="Copy token address"
                                                />
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
                                                <img
                                                    src="/copy-icon.svg"
                                                    alt="Copy token address"
                                                />
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
                            emptyText="Your Mint and Redeem story will be here"
                        />
                    </SideBar>
                    <div className="col content-col dashboard-col">
                        <Header section="uzd" />
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
                                                                    ? `${zunamiInfo.apy.toFixed(
                                                                          2
                                                                      )}%`
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
                                                Protocol Takes 0,5% redemption fee. It will be
                                                cheaper and easier to withdraw using the Curve pool
                                            </div>
                                            <a
                                                href="https://curve.fi/#/ethereum/pools/factory-v2-284/deposit"
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
                                    <div
                                        className={`inputs ${
                                            mode === 'redeem' ? 'redeem' : 'mint'
                                        }`}
                                    >
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
                                                            Number(inputVal) <= 0 ||
                                                            isNaN(inputVal);

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
                                        </div>
                                        <div className="s-coin">
                                            <div className="left-part">
                                                <div className="action">
                                                    I {mode !== 'mint' ? 'send' : 'receive'}
                                                </div>
                                                <div className="coin d-flex align-item-center">
                                                    <span>UZD COIN</span>
                                                    <svg
                                                        className="ms-1"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 16 16"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <circle
                                                            cx="8"
                                                            cy="8"
                                                            r="8"
                                                            fill="url(#paint0_linear_120_10487)"
                                                        />
                                                        <path
                                                            d="M12.6216 9.16714L12.3903 8.76146C12.3663 8.71937 12.3335 8.68208 12.2939 8.65173C12.2542 8.62138 12.2085 8.59857 12.1593 8.58461C12.1102 8.57042 12.0585 8.56536 12.0072 8.56971C11.956 8.57406 11.9061 8.58773 11.8606 8.60994L9.70492 9.66152L8.67618 7.85692L10.2869 4.26314C10.3126 4.2064 10.3218 4.14444 10.3136 4.0834C10.311 4.03046 10.2959 3.9787 10.2693 3.93177L10.0381 3.5262C10.0141 3.4841 9.9813 3.44681 9.94167 3.41647C9.90203 3.38613 9.8563 3.36334 9.80711 3.3494C9.75797 3.33523 9.70627 3.33018 9.655 3.33451C9.60374 3.33885 9.55392 3.3525 9.50837 3.37468L6.858 4.66763L6.32307 3.72931C6.29906 3.68722 6.26628 3.64993 6.22665 3.61958C6.18702 3.58924 6.14131 3.56642 6.09212 3.55246C6.04299 3.53823 5.99129 3.53314 5.94002 3.53749C5.88874 3.54184 5.83891 3.55554 5.79339 3.5778L5.35493 3.79164C5.30943 3.81387 5.26912 3.84418 5.23631 3.88085C5.2035 3.91752 5.17884 3.95982 5.16375 4.00533C5.14841 4.05079 5.14292 4.0986 5.14761 4.14602C5.1523 4.19344 5.16708 4.23954 5.19108 4.28167L5.726 5.21982L4.20892 5.95987C4.16342 5.98206 4.1231 6.01235 4.0903 6.04901C4.0575 6.08566 4.03286 6.12795 4.01779 6.17344C4.00243 6.2189 3.99693 6.26673 4.00162 6.31416C4.00631 6.3616 4.0211 6.40771 4.04512 6.44984L4.27636 6.85541C4.30036 6.89751 4.33312 6.9348 4.37275 6.96514C4.41239 6.99548 4.45812 7.01828 4.50731 7.03221C4.55645 7.04639 4.60812 7.05146 4.65939 7.04712C4.71065 7.04279 4.7605 7.02912 4.80605 7.00693L6.32295 6.26693L7.26376 7.91724L5.56815 11.7003C5.54591 11.7523 5.53617 11.8082 5.53959 11.864C5.54319 11.9199 5.55989 11.9744 5.58853 12.0238C5.59413 12.0333 5.59843 12.0411 5.60284 12.049L5.84445 12.4731C5.86844 12.5152 5.90119 12.5525 5.94081 12.5829C5.98044 12.6132 6.02616 12.636 6.07534 12.6499C6.1131 12.6608 6.15242 12.6663 6.19196 12.6663C6.25544 12.6663 6.31795 12.652 6.37414 12.6247L9.16993 11.2608L9.49394 11.8291C9.51794 11.8712 9.5507 11.9085 9.59033 11.9389C9.62997 11.9692 9.67569 11.992 9.72489 12.0059C9.77403 12.0201 9.8257 12.0252 9.87697 12.0209C9.92823 12.0165 9.97808 12.0029 10.0236 11.9807L10.4621 11.7668C10.5076 11.7445 10.5479 11.7142 10.5807 11.6776C10.6135 11.6409 10.6381 11.5986 10.6532 11.5531C10.6685 11.5077 10.674 11.4599 10.6693 11.4124C10.6646 11.365 10.6499 11.3189 10.6259 11.2768L10.3019 10.7086L12.4577 9.657C12.5032 9.63479 12.5435 9.60449 12.5763 9.56783C12.6092 9.53117 12.6338 9.48887 12.6489 9.44337C12.6642 9.39794 12.6697 9.35015 12.665 9.30274C12.6604 9.25534 12.6456 9.20926 12.6216 9.16714ZM7.45495 5.71474L8.47362 5.21786L7.90058 6.49636L7.45495 5.71474ZM8.57298 10.2137L7.35323 10.8087L8.03935 9.27774L8.57298 10.2137Z"
                                                            fill="white"
                                                        />
                                                        <defs>
                                                            <linearGradient
                                                                id="paint0_linear_120_10487"
                                                                x1="3"
                                                                y1="13.6667"
                                                                x2="15"
                                                                y2="1"
                                                                gradientUnits="userSpaceOnUse"
                                                            >
                                                                <stop stopColor="#FB6E01" />
                                                                <stop
                                                                    offset="1"
                                                                    stopColor="#FF9D01"
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="right-part">
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
                                                                sushi.getEthContract(),
                                                                account,
                                                                APPROVE_SUM,
                                                                contractAddresses.uzd[1]
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
                                            <input
                                                type="button"
                                                className={`zun-button ${
                                                    depositDisabled ? 'disabled' : ''
                                                }`}
                                                value="Mint"
                                                onClick={async () => {
                                                    setPendingTx(true);

                                                    const sum = new BigNumber(zunLpValue)
                                                        .multipliedBy(BIG_TEN.pow(UZD_DECIMALS))
                                                        .toString();

                                                    log(
                                                        `UZD contract (ETH): deposit('${sum}', '${account}')`
                                                    );

                                                    try {
                                                        const tx =
                                                            await sushi.contracts.uzdContract.methods
                                                                .deposit(sum, account)
                                                                .send({
                                                                    from: account,
                                                                });

                                                        setTransactionId(tx.transactionHash);
                                                    } catch (error: any) {
                                                        setTransactionError(true);
                                                        log(
                                                            `❗️ Error while minting UZD: ${error.message}`
                                                        );
                                                    }

                                                    setPendingTx(false);
                                                }}
                                            />
                                        )}
                                        {uzdAllowance.toNumber() === 0 && mode === 'redeem' && (
                                            <div>
                                                <input
                                                    type="button"
                                                    className={`zun-button ${
                                                        pendingTx ? 'disabled' : ''
                                                    }`}
                                                    value="Approve UZD"
                                                    onClick={async () => {
                                                        setPendingTx(true);

                                                        try {
                                                            await approve(
                                                                ethereum,
                                                                contractAddresses.uzd[1],
                                                                sushi.getEthContract(),
                                                                account,
                                                                APPROVE_SUM,
                                                                contractAddresses.uzd[1]
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
                                        {uzdAllowance.toNumber() > 0 && mode === 'redeem' && (
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
                                                            log(
                                                                'UZD contract (ETH): withdrawAll()'
                                                            );

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
                                                                .multipliedBy(
                                                                    BIG_TEN.pow(UZD_DECIMALS)
                                                                )
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
                                    {/* {mode === 'mint' && (
                                        <div className="mt-3" style={{ fontSize: '12px' }}>
                                            ZLP allowance: {zlpAllowance.toString()}
                                        </div>
                                    )}
                                    {mode === 'redeem' && (
                                        <div className="mt-3" style={{ fontSize: '12px' }}>
                                            UZD allowance: {uzdAllowance.toString()}
                                        </div>
                                    )} */}
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
                                                            : `${zunamiInfo.curve.uzdRewardApy.toFixed(
                                                                  2
                                                              )}%`}
                                                    </div>
                                                </div>
                                                <a
                                                    href="https://curve.fi/#/ethereum/pools/factory-v2-284/deposit"
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
                                                    Issue UZD tokens instead of your Zunami LP
                                                    tokens
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
                                </div>
                                <TransactionHistory
                                    className={`d-block d-md-none flex-fill`}
                                    title="Transactions history"
                                    items={transactionList}
                                    onPageEnd={() => {
                                        if (transHistoryPage !== -1) {
                                            setTransHistoryPage(transHistoryPage + 1);
                                        }
                                    }}
                                    emptyText="Your Mint and Redeem story will be here"
                                />
                            </div>
                        </div>
                        <SupportersBar section="uzd" />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
