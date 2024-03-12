import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import './Earn.scss';
import { MobileSidebar } from '../components/SideBar/MobileSidebar/MobileSidebar';
import { AllServicesPanel } from '../components/AllServicesPanel/AllServicesPanel';
import { SideBar, ZunamiInfoFetch } from '../components/SideBar/SideBar';
import { Header } from '../components/Header/Header';

import { MicroCard } from '../components/MicroCard/MicroCard';
import { BIG_ZERO, NULL_ADDRESS } from '../utils/formatbalance';
import { Preloader } from '../components/Preloader/Preloader';
import { SupportersBar } from '../components/SupportersBar/SupportersBar';
import Accordion from 'react-bootstrap/Accordion';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import useBalanceOf from '../hooks/useBalanceOf';
import { getZunStakingAddress, getZunUsdApsAddress } from '../utils/zunami';
import { useAccount, useNetwork } from 'wagmi';
import { APPROVE_SUM } from '../sushi/utils';
import useApprove from '../hooks/useApprove';
import useStakingPools from '../hooks/useStakingPools';
import { StakingPool } from '../components/StakingPool/StakingPool';
import useAllowance from '../hooks/useAllowance';
import { renderMobileMenu } from '../components/Header/NavMenu/NavMenu';

const FILTERS = ['My pools', 'USD', 'ETH', 'Convex', 'Stake DAO', 'Zunami'];

export const Earn = (): JSX.Element => {
    const { address: account } = useAccount();
    const [tvl, setTvl] = useState('0');
    const dailyProfit = Number(0);
    const monthlyProfit = Number(0);
    const yearlyProfit = Number(0);
    const [pendingTx, setPendingTx] = useState(false);
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const apsBalance = useBalanceOf(getZunUsdApsAddress(chainId));
    const pools = useStakingPools();
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const filterActive = category !== null || searchText !== '';
    const poolsFiltered = useMemo(() => {
        return pools.filter((pool) => {
            if (searchText) {
                return pool.title.indexOf(searchText) !== -1;
            }

            if (category === 'My pools') {
                return pool.balance.toNumber() > 0;
            }

            if (category) {
                return (
                    pool.title.indexOf(category) !== -1 || pool.platform.indexOf(category) !== -1
                );
            }

            return pool;
        });
    }, [category, searchText, pools]);

    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <React.Fragment>
                <MobileSidebar />
                <AllServicesPanel />
                {/* {!supportedChain && (
                    <UnsupportedChain
                        text="You're using unsupported chain. Please, switch to Ethereum network."
                        customNetworksList={[networks[0]]}
                    />
                )} */}
                <div className="container">
                    <div className="row main-row h-100">
                        <SideBar isMainPage={true} tvl={tvl}>
                            <div className="row">
                                <div className="col sidebar-links mt-3 d-none d-lg-flex">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            document
                                                .getElementById('all-services')
                                                ?.classList.toggle('active');
                                            document
                                                .getElementById('sidebar-col')
                                                ?.classList.toggle('transparent');
                                            document
                                                .getElementById('nav-menu')
                                                ?.classList.toggle('hidden');
                                        }}
                                    >
                                        <svg
                                            width="22"
                                            height="23"
                                            viewBox="0 0 22 23"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M14.6599 0.7805C13.0264 0.694891 11.6327 1.94972 11.5471 3.58324L11.3875 6.62912C11.3019 8.26264 12.5567 9.65627 14.1902 9.74188L17.2361 9.90151C18.8696 9.98712 20.2633 8.73228 20.3489 7.09876L20.5085 4.05289C20.5941 2.41937 19.3393 1.02574 17.7057 0.940127L14.6599 0.7805ZM0.155378 15.6116C0.0697685 13.978 1.3246 12.5844 2.95812 12.4988L6.00399 12.3392C7.63752 12.2536 9.03115 13.5084 9.11676 15.1419L9.27638 18.1878C9.36199 19.8213 8.10716 21.215 6.47364 21.3006L3.42777 21.4602C1.79425 21.5458 0.400614 20.291 0.315005 18.6574L0.155378 15.6116ZM13.04 13.4357C11.5486 14.1076 10.8844 15.8614 11.5563 17.3527L13.0413 20.6485C13.7133 22.1399 15.467 22.8041 16.9584 22.1322L20.2542 20.6472C21.7455 19.9752 22.4098 18.2215 21.7378 16.7301L20.2528 13.4343C19.5809 11.943 17.8271 11.2787 16.3358 11.9507L13.04 13.4357Z"
                                                fill="url(#paint0_linear_18_112667)"
                                            />
                                            <path
                                                d="M0.155009 4.05394C0.0694001 2.42042 1.32423 1.02679 2.95775 0.941182L6.00363 0.781555C7.63715 0.695945 9.03078 1.95078 9.11639 3.5843L9.27602 6.63017C9.36163 8.26369 8.10679 9.65732 6.47327 9.74293L3.4274 9.90256C1.79388 9.98817 0.400246 8.73334 0.314637 7.09982L0.155009 4.05394Z"
                                                fill="#CDCDCD"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear_18_112667"
                                                    x1="14.254"
                                                    y1="21.9757"
                                                    x2="19.1462"
                                                    y2="12.1914"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <stop stopColor="#ADADAD" />
                                                    <stop offset="1" stopColor="#CCCCCC" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span>All services</span>
                                    </button>
                                    <a
                                        href="https://zunamilab.gitbook.io/zunami-docs/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <svg
                                            width="28"
                                            height="21"
                                            viewBox="0 0 28 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12.6032 17.5019C13.0406 17.5019 13.4342 17.8653 13.4342 18.3651C13.4342 18.8194 13.0843 19.2282 12.6032 19.2282C12.1658 19.2282 11.7721 18.8648 11.7721 18.3651C11.7721 17.8653 12.1658 17.5019 12.6032 17.5019ZM25.463 12.232C25.0256 12.232 24.6319 11.8686 24.6319 11.3688C24.6319 10.9145 24.9819 10.5056 25.463 10.5056C25.9004 10.5056 26.2941 10.8691 26.2941 11.3688C26.2941 11.8231 25.9004 12.232 25.463 12.232ZM25.463 8.73387C24.0633 8.73387 22.926 9.91506 22.926 11.3688C22.926 11.6414 22.9698 11.914 23.0573 12.1866L14.7027 16.8204C14.2216 16.0936 13.4342 15.6847 12.6032 15.6847C11.6409 15.6847 10.766 16.2753 10.3286 17.1384L2.80518 13.0497C2.01784 12.5954 1.40547 11.278 1.49295 10.0059C1.53669 9.3699 1.7554 8.87016 2.06158 8.68844C2.28029 8.55215 2.49899 8.59758 2.80518 8.73387L2.84892 8.7793C4.86101 9.86963 11.3784 13.4132 11.6409 13.5495C12.0783 13.7312 12.297 13.822 13.0406 13.4586L26.5128 6.18979C26.7315 6.09893 26.9502 5.91721 26.9502 5.5992C26.9502 5.19033 26.5565 5.0086 26.5565 5.0086C25.7692 4.64516 24.5882 4.05457 23.4509 3.50941C21.0014 2.32822 18.202 0.96532 16.9773 0.283868C15.9275 -0.306724 15.0527 0.193008 14.9214 0.283868L14.6153 0.420158C9.06014 3.32769 1.71166 7.09839 1.27425 7.37097C0.530649 7.82527 0.0494977 8.77931 0.00575671 9.96048C-0.0817253 11.8231 0.836836 13.7766 2.14907 14.4581L10.1099 18.7285C10.2849 20.0005 11.3784 21 12.6032 21C14.0029 21 15.0964 19.8642 15.1401 18.4105L23.8883 13.504C24.3258 13.8675 24.8944 14.0492 25.463 14.0492C26.8627 14.0492 28 12.868 28 11.4142C28 9.91505 26.8627 8.73387 25.463 8.73387Z"
                                                fill="#ADADAD"
                                            />
                                        </svg>
                                        <span>Docs</span>
                                    </a>
                                </div>
                            </div>
                            <div className="mobile-menu-title d-block d-lg-none">Menu</div>
                            <div
                                className="d-flex d-lg-none gap-3 mt-4 pb-3 mobile-menu"
                                style={{
                                    fontSize: '13px',
                                    overflowX: 'scroll',
                                }}
                            >
                                {renderMobileMenu()}
                            </div>
                            <div className="Sidebar__Content__Data">
                                <div className="title">Your data</div>
                                <div className="values gap-2">
                                    <div className="balance col-6">
                                        <div className="title d-flex gap-2 justify-content-between">
                                            <span>Balance</span>
                                        </div>
                                        <div className="value">0</div>
                                    </div>
                                    <div className="total-income col-6">
                                        <div className="title d-flex gap-2 justify-content-between">
                                            <span>Already claimed</span>
                                        </div>
                                        <div className="value">$20,040</div>
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <div className="profits">
                                    <div className="daily">
                                        <div className="title">Daily profit</div>
                                        <div className="value vela-sans">
                                            {`${dailyProfit ? dailyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="monthly">
                                        <div className="title">Monthly profit</div>
                                        <div className="value vela-sans">
                                            {`${monthlyProfit ? monthlyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                    <div className="yearly">
                                        <div className="title">Yearly profit</div>
                                        <div className="value vela-sans">
                                            {`${yearlyProfit ? yearlyProfit.toFixed(2) : 0} USD`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SideBar>
                        <div className="col content-col dashboard-col earn-container">
                            <Header section="dashboard" />
                            <div className="row ms-lg-5 mt-1">
                                <div className="col-sm-12 col-md-4">
                                    <input
                                        type="search"
                                        className="form-control rounded-pill search-filter"
                                        placeholder="Search..."
                                        value={searchText}
                                        onChange={(e) => {
                                            setSearchText(e.currentTarget.value);
                                            setCategory(null);
                                        }}
                                    />
                                </div>
                                <div className="col-sm-12 col-md-8">
                                    <div className="d-flex flex-wrap gap-2 ms-0 ms-md-3 mt-3 mt-md-0">
                                        {FILTERS.map((key: string) => (
                                            <button
                                                className={`btn btn-secondary rounded-pill filter px-3 ${
                                                    key === category ? 'active' : ''
                                                }`}
                                                onClick={(e) => {
                                                    if (key === category) {
                                                        setCategory(null);
                                                    } else {
                                                        setCategory(key);
                                                    }
                                                }}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-lg-5">
                                <div className="col mt-2">
                                    <Accordion
                                        id="strats-accordion"
                                        className="w-100 gap-3 mt-5"
                                        defaultActiveKey="0"
                                    >
                                        {!pools.length && <Preloader />}
                                        {!poolsFiltered.length && filterActive && (
                                            <p className="text-muted">
                                                No pools with these criterias
                                            </p>
                                        )}
                                        {poolsFiltered &&
                                            poolsFiltered.map((pool, index) => (
                                                <StakingPool
                                                    index={index.toString()}
                                                    key={index}
                                                    {...pool}
                                                    maxStakingSum={apsBalance}
                                                />
                                            ))}
                                    </Accordion>
                                </div>
                            </div>
                            <SupportersBar section="dashboard" className="mt-2" />
                        </div>
                    </div>
                </div>
                <div
                    className="d-flex justify-content-center d-md-none text-center flex-column"
                    style={{ width: '100%', padding: '35px', color: '#B3B3B3' }}
                >
                    <div
                        style={{ height: '2px', backgroundColor: '#EFEFEF', margin: '20px 0' }}
                    ></div>
                    <div className="text-center">About Zunami Protocol</div>
                    <p style={{ fontSize: '14px', marginTop: '20px', color: '#B3B3B3' }}>
                        Zunami is a decentralized protocol that issues aggregated stablecoins, whose
                        collateral is utilized in omnipools and differentiated among various
                        profit-generating strategies.
                    </p>
                    <div className="d-flex gap-2 mt-3">
                        <a
                            href="https://zunamilab.gitbook.io/zunami-docs/"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
                            Documentation
                        </a>
                        <a
                            href="https://www.zunami.io/#faq-main"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
                            FAQ
                        </a>
                        <a
                            href="https://zunami.io"
                            className="badge rounded-pill text-bg-secondary bg-secondary"
                        >
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
                    <p style={{ color: '#B3B3B3' }}>© 2024 Zunami Protocol. Version 2.0</p>
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
            </React.Fragment>
        </Suspense>
    );
};
