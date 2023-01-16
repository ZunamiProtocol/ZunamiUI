import { useState, useCallback, useEffect } from 'react';
import './WalletStatus.scss';
import { useWallet } from 'use-wallet';
import { WalletsModal } from '../WalletsModal/WalletsModal';
import { log } from '../../utils/logger';
import { networks, Network } from '../NetworkSelector/NetworkSelector';

export const WalletStatus = (): JSX.Element => {
    const { account, reset, chainId } = useWallet();
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    const [open, setOpen] = useState(false);
    const eth = window.ethereum;
    const [chainSupported, setChainSupported] = useState(false);
    const networksList = networks;
    const availableNetworks = networksList.filter(
        (item) => [1, 56, 137].indexOf(parseInt(item.key, 16)) !== -1
    );

    useEffect(() => {
        if (!chainId) {
            return;
        }

        const defaultNetwork = networks.filter(
            (network) => parseInt(network.key, 16) === chainId
        )[0];

        setActiveNetwork(defaultNetwork);
    }, [chainId, activeNetwork]);

    const handleSignOutClick = useCallback(() => {
        reset();
        window.localStorage.clear();
    }, [reset]);

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!chainId) {
            return;
        }

        const supportedChainIds = [1, 56, 137];

        const defaultNetwork = networks.filter(
            (network) => parseInt(network.key, 16) === chainId
        )[0];

        // if (!hideActiveNetwork) {
        setActiveNetwork(defaultNetwork);
        // }

        setChainSupported(supportedChainIds.indexOf(parseInt(activeNetwork.key, 16)) !== -1);
    }, [chainId, activeNetwork]);

    if (account) {
        const shortAddress = `${account.substring(0, 6)}...${account.substring(
            account.length - 4
        )}`;

        log(`Active wallet: ${account}`);

        return (
            <div className={'WalletStatus mt-4 WalletStatus__connected'}>
                <div className="WalletStatus__inner">
                    <div className="WalletStatus__inner__network">
                        {activeNetwork.icon}
                        <span>{activeNetwork.value}</span>
                    </div>
                    <div className="WalletStatus__inner__wallet">
                        <div className="state">Connected wallet</div>
                        <span className="address">{shortAddress}</span>
                    </div>
                    <div className="network">
                        <button
                            className="btn btn-light btn-sm d-flex align-items-center"
                            onClick={() => {
                                setOpen(!open);
                                document
                                    .getElementById('networks-selector')
                                    ?.classList.toggle('active');
                            }}
                        >
                            Change network
                        </button>
                    </div>
                    <div className="logout">
                        <button
                            className="btn btn-light btn-sm d-flex align-items-center"
                            onClick={handleSignOutClick}
                        >
                            Log out
                        </button>
                    </div>
                </div>
                <div
                    className={`WalletStatus__toggler ${open ? 'opened' : ''}`}
                    onClick={() => {
                        setOpen(!open);
                        document.getElementById('networks-selector')?.classList.toggle('active');
                    }}
                >
                    {!open && (
                        <svg
                            width="7"
                            height="7"
                            viewBox="0 0 7 7"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.97548 7L3.23189 7L4.04188 4.12822H7V2.87181H4.39625L5.20625 0H3.94984L3.13984 2.87181H0V4.12822H2.78547L1.97548 7Z"
                                fill="white"
                            />
                        </svg>
                    )}
                    {open && (
                        <svg
                            width="14"
                            height="4"
                            viewBox="0 0 14 4"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1.09839e-07 3.32044L0 0.807618L14 0.807617V3.32044L1.09839e-07 3.32044Z"
                                fill="white"
                            />
                        </svg>
                    )}
                </div>
                <div id="networks-selector">
                    <div className="title">Choose preferable network</div>
                    <div
                        className="close"
                        onClick={() => {
                            setOpen(!open);
                            document
                                .getElementById('networks-selector')
                                ?.classList.remove('active');
                        }}
                    >
                        <img src="/exit.png" alt="" />
                    </div>
                    <div className="networks">
                        {availableNetworks.map((network) => (
                            <div
                                key={network.key}
                                data-value={network.key}
                                className="network-item"
                            >
                                <div className="inner">
                                    {network.icon}
                                    <div className="title">{network.value}</div>
                                </div>
                                <div>
                                    <button
                                        className="choose-btn"
                                        onClick={async (e) => {
                                            const selectedValue = network.key;

                                            setActiveNetwork(network);

                                            log(
                                                `Network switch to ${selectedValue} (select onChange)`
                                            );

                                            if (eth && eth.request) {
                                                try {
                                                    await eth.request({
                                                        method: 'wallet_switchEthereumChain',
                                                        params: [{ chainId: selectedValue }],
                                                    });

                                                    document
                                                        .getElementById('networks-selector')
                                                        ?.classList.remove('active');
                                                } catch (e) {
                                                    let chainParams = {
                                                        chainId: '0x38',
                                                        chainName: 'Binance Smart Chain Mainnet',
                                                        nativeCurrency: {
                                                            name: 'Binance Coin',
                                                            symbol: 'BNB',
                                                            decimals: 18,
                                                        },
                                                        rpcUrls: [
                                                            'https://bsc-dataseed1.ninicoin.io',
                                                        ],
                                                        blockExplorerUrls: ['https://bscscan.com'],
                                                    };

                                                    if (selectedValue === '0x89') {
                                                        chainParams = {
                                                            chainId: '0x89',
                                                            chainName: 'Polygon Mainnet',
                                                            nativeCurrency: {
                                                                name: 'MATIC',
                                                                symbol: 'MATIC',
                                                                decimals: 18,
                                                            },
                                                            rpcUrls: ['https://polygon-rpc.com'],
                                                            blockExplorerUrls: [
                                                                'https://polygonscan.com',
                                                            ],
                                                        };
                                                    }

                                                    window.ethereum
                                                        .request({
                                                            method: 'wallet_addEthereumChain',
                                                            params: [chainParams],
                                                        })
                                                        .catch((error) => {
                                                            log(error);
                                                        });
                                                }
                                            }
                                        }}
                                    >
                                        Choose network
                                    </button>
                                </div>
                                <div className="bg">{network.icon}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={'WalletStatus mt-5'}>
            <WalletsModal
                show={show}
                onHide={() => {
                    setShow(false);
                }}
            />
            <div className="ms-3 text-center">
                <input
                    type="button"
                    className="WalletStatus__Connect"
                    value="Connect wallet"
                    onClick={() => setShow(true)}
                />
            </div>
        </div>
    );
};
