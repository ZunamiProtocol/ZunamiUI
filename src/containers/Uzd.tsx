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
import { ZunamiInfo, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import { zunamiInfoUrl, curvePoolsApyUrl } from '../api/api';
import useFetch from 'react-fetch-hook';
import { UnsupportedChain } from '../components/UnsupportedChain/UnsupportedChain';
import { UzdMigrationModal } from '../components/UzdMigrationModal/UzdMigrationModal';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { networks } from '../components/NetworkSelector/NetworkSelector';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

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

    return (
        <React.Fragment>
            <Header />
            <MobileSidebar />
            <Container className={'h-100 d-flex justify-content-between flex-column UzdContainer'}>
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
                <div className="UzdContainer__Content">
                    <div className="UzdContainer__Sidebar">
                        <div className="UzdContainer__Sidebar_Title">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7.23993 0.984478C5.06127 1.92593 3.2107 3.49229 1.92225 5.48548C0.6338 7.47867 -0.034665 9.80917 0.00138492 12.1823C0.0374349 14.5554 0.776381 16.8645 2.12478 18.8176C3.47318 20.7708 5.37047 22.2802 7.57673 23.155C9.78298 24.0299 12.1991 24.2308 14.5196 23.7325C16.8401 23.2342 18.9606 22.0589 20.6132 20.3554C22.2657 18.6519 23.376 16.4966 23.8036 14.162C24.2312 11.8275 23.957 9.41859 23.0155 7.23993C22.3904 5.79335 21.4865 4.48406 20.3554 3.38681C19.2243 2.28956 17.8882 1.42585 16.4233 0.844973C14.9584 0.264101 13.3934 -0.022552 11.8177 0.00138449C10.242 0.025321 8.68651 0.359377 7.23993 0.984478Z"
                                    fill="url(#paint0_linear_71_28276)"
                                />
                                <path
                                    d="M18.7151 14.046L18.3485 13.351C18.2832 13.2278 18.1717 13.1356 18.0385 13.0944C17.9053 13.0532 17.7612 13.0663 17.6377 13.131L14.135 14.9782L12.4382 11.7605L15.0094 5.55877C15.0376 5.48003 15.0501 5.39648 15.0459 5.31291C15.0418 5.22935 15.0212 5.14744 14.9852 5.07188L14.6187 4.37686C14.5533 4.25373 14.4419 4.16148 14.3087 4.12026C14.1755 4.07905 14.0314 4.09222 13.9079 4.1569L9.6207 6.41776L8.72801 4.72497C8.66262 4.60185 8.55115 4.5096 8.41797 4.46839C8.28479 4.42718 8.14071 4.44034 8.0172 4.505L7.32217 4.87152C7.19905 4.93692 7.10681 5.04838 7.0656 5.18156C7.02438 5.31474 7.03755 5.45882 7.10221 5.58233L7.99489 7.27512L5.50503 8.58814C5.38191 8.65354 5.28966 8.765 5.24844 8.89819C5.20723 9.03137 5.22039 9.17545 5.28504 9.29896L5.65156 9.99398C5.71697 10.1171 5.82843 10.2093 5.96161 10.2506C6.0948 10.2918 6.23888 10.2786 6.36239 10.2139L8.85225 8.90092L10.4096 11.8541L7.70434 18.3792C7.67413 18.4554 7.66092 18.5372 7.66566 18.6189C7.67039 18.7007 7.69295 18.7804 7.73176 18.8526C7.74741 18.8814 7.75707 18.9015 7.77145 18.9288L8.13797 19.6238C8.20337 19.7469 8.31484 19.8392 8.44802 19.8804C8.58121 19.9216 8.72529 19.9084 8.8488 19.8438L13.3666 17.4613L13.9248 18.5199C13.9902 18.643 14.1017 18.7353 14.2348 18.7765C14.368 18.8177 14.5121 18.8045 14.6356 18.7398L15.3306 18.3733C15.4538 18.3079 15.546 18.1965 15.5872 18.0633C15.6285 17.9301 15.6153 17.786 15.5506 17.6625L14.9924 16.6039L18.4951 14.7568C18.6182 14.6914 18.7105 14.5799 18.7517 14.4468C18.7929 14.3136 18.7797 14.1695 18.7151 14.046V14.046ZM10.4781 8.04355L12.4124 7.0235L11.3242 9.64813L10.4781 8.04355ZM10.2561 17.0237L11.5236 13.9665L12.5092 15.8355L10.2561 17.0237Z"
                                    fill="white"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_71_28276"
                                        x1="13.8689"
                                        y1="1.91725"
                                        x2="9.99721"
                                        y2="22.8336"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FFB515" />
                                        <stop offset="0.19046" stopColor="#FF931C" />
                                        <stop offset="0.41364" stopColor="#FF7322" />
                                        <stop offset="0.62821" stopColor="#FF5B26" />
                                        <stop offset="0.82823" stopColor="#FF4D29" />
                                        <stop offset="0.99932" stopColor="#FF482A" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <h2>UZD Stablecoin</h2>
                        </div>
                        <div className="UzdContainer__Sidebar_Hero">
                            <p>
                                UZD - rebase token with a balance that grows in proportion to APY
                                Zunami.
                            </p>
                            <p>
                                UZD is minted using the LP tokens of our protocol and backed by
                                stablecoins, which are allocated in Curve pools.
                            </p>
                        </div>
                        <div className="row">
                            <div className="col-sm-6 col-6">
                                <div
                                    className="InfoBlock InfoBlock_colorful"
                                    data-title="UZD Balance"
                                >
                                    <div className="InfoBlock__title ">
                                        <span>UZD Balance</span>
                                        <div className="InfoBlock__buttons">
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
                                    <div className="InfoBlock__description InfoBlock__description_color">
                                        <div>{formatUzd(uzdBalance)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-6">
                                <div
                                    className="InfoBlock InfoBlock_colorful"
                                    data-title="ZLP Balance"
                                >
                                    <div className="InfoBlock__title ">
                                        <span>ZLP Balance</span>
                                        <div className="InfoBlock__buttons">
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
                                    <div className="InfoBlock__description InfoBlock__description_color">
                                        <div>{getFullDisplayBalance(zlpBalance)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <InfoBlock
                                    isStrategy={false}
                                    withColor={true}
                                    title="Total UZD issued"
                                    description={getFullDisplayBalance(uzdTotalSupply)}
                                    colorfulBg={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6 col-6">
                                <InfoBlock
                                    isStrategy={false}
                                    withColor={true}
                                    title="LTV"
                                    description={`${ltvValue}%`}
                                    colorfulBg={true}
                                />
                            </div>
                            <div className="col-sm-6 col-6">
                                <InfoBlock
                                    isStrategy={false}
                                    withColor={true}
                                    title="APY"
                                    description={`${
                                        zunamiInfo && !zunError
                                            ? `${zunamiInfo.apy.toFixed(2)}%`
                                            : 'n/a'
                                    }`}
                                    colorfulBg={true}
                                />
                            </div>
                        </div>
                    </div>
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
                            <div className="row">
                                <div className="col-sm-6">
                                    <h2>Mint / Redeem</h2>
                                    <div className="mint-redeem-inputs">
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
                                                            const inputVal =
                                                                e.nativeEvent.target.value;

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
                                                <span>
                                                    Tap to {mode === 'mint' ? 'Redeem' : 'Mint'}
                                                </span>
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
                                                                const inputVal =
                                                                    e.nativeEvent.target.value;

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
                                                                        formatBigNumberFull(
                                                                            uzdBalance
                                                                        )
                                                                    );

                                                                    setZunLpValue(
                                                                        convertUzdToZlp(
                                                                            uzdBalance.dividedBy(
                                                                                BIG_TEN.pow(
                                                                                    UZD_DECIMALS
                                                                                )
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
                                                <OverlayTrigger placement="right" overlay={<Tooltip>{hint}</Tooltip>}>
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
                                                                log(
                                                                    'UZD contract (ETH): withdrawAll()'
                                                                );

                                                                tx =
                                                                    await sushi.contracts.uzdContract.methods
                                                                        .withdrawAll(
                                                                            account,
                                                                            account
                                                                        )
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
                                                                            BIG_TEN.pow(
                                                                                UZD_DECIMALS
                                                                            )
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
                                </div>
                                <div className={`col-sm-6 col-12`}>
                                    {mode === 'mint' && (
                                        <div>
                                            <div className="curve-boost">
                                                <div className="left-part">
                                                    <img src="/curve-icon.svg" alt="" />
                                                    <div>
                                                        <div>Boost your APY</div>
                                                        <div>on Curve</div>
                                                    </div>
                                                </div>
                                                <div className="divider"></div>
                                                <div className="pool-percent">
                                                    <div className="inner">
                                                        <div className="title">Curve APY / Extra Reward APR</div>
                                                    </div>
                                                    <div className="percent">
                                                        {uzdCurvePool.apyFormatted} / {isLoading ? 'n/a' : `${zunamiInfo.curve.uzdRewardApr.toFixed(2)}%`}
                                                    </div>
                                                </div>
                                            </div>
                                            <h2 className="how-it-works">How it works?</h2>
                                            <ul>
                                                <li>
                                                    <div className="counter">1</div>
                                                    <span>
                                                        Make a deposit in the Zunami Protocol and
                                                        get LP tokens
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
                                            <a
                                                href="https://curve.exchange/#/ethereum/pools/factory-v2-218/deposit"
                                                className="go-to-curve"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img src="/curve-icon.svg" alt="" />
                                                <span>Go to Curve</span>
                                            </a>
                                        </div>
                                    )}
                                    {mode === 'redeem' && (
                                        <div>
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
            <footer className="">
                <div className="mobile">
                    <a href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing">
                        View docs
                    </a>
                    <a href="https://www.zunami.io/#faq-main" target="_blank" rel="noreferrer">
                        FAQ
                    </a>
                </div>
                <span className="copyright">
                    © 2022 Zunami Protocol. {`Version: ${process.env.REACT_APP_VERSION}`}
                </span>
                <ul className="list-inline mb-0">
                    <li className="list-inline-item">
                        <a
                            href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing"
                            target="blank"
                        >
                            View docs
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="https://www.zunami.io/#faq-main" target="blank">
                            FAQ
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="https://zunami.io" target="blank">
                            Website
                        </a>
                    </li>
                </ul>
            </footer>
        </React.Fragment>
    );
};
