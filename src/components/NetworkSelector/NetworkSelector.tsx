import { ReactElement, useEffect, useState } from 'react';
import './NetworkSelector.scss';
import { ReactComponent as ETHLogo } from './eth_logo.svg';
import { ReactComponent as BSCLogo } from './bsc_logo.svg';
import { log } from '../../utils/logger';
import { useWallet } from 'use-wallet';

interface NetworkSelectorProps extends React.HTMLProps<HTMLDivElement> {
    onNetworkChange?: Function;
    defaultNetwork: Network;
    autoChange: boolean;
}

export interface Network {
    key: string;
    value: string;
    icon: ReactElement;
}

export const networks = [
    {
        id: 1,
        key: '0x1',
        value: 'Ethereum',
        icon: <ETHLogo />,
    },
    {
        id: 56,
        key: '0x38',
        value: 'Binance',
        icon: <BSCLogo />,
    },
    {
        key: '0x3',
        value: 'Ropsten Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0x4',
        value: 'Rinkeby Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0x2a',
        value: 'Kovan Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0x5',
        value: 'Goerli Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0x61',
        value: 'Smart Chain Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0x89',
        value: 'Polygon',
        icon: <ETHLogo />,
    },
    {
        key: '0x13881',
        value: 'Mumbai',
        icon: <ETHLogo />,
    },
    {
        key: '0xa86a',
        value: 'Avalanche',
        icon: <ETHLogo />,
    },
    {
        key: '0xa869',
        value: 'Avalanche Testnet',
        icon: <ETHLogo />,
    },
    {
        key: '0xfa',
        value: 'Fantom',
        icon: <ETHLogo />,
    },
];

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
    defaultNetwork = networks[0],
    className,
    onNetworkChange,
    autoChange = true,
}) => {
    const [activeNetwork, setActiveNetwork] = useState<Network>(defaultNetwork);
    const eth = window.ethereum;
    const { chainId } = useWallet();
    const supportedChainIds = [1, 56];
    const [chainSupported, setChainSupported] = useState(false);
    const availableNetworks = networks.filter(
        (item) => [1, 56].indexOf(parseInt(item.key, 16)) !== -1
    );

    useEffect(() => {
        if (!chainId) {
            return;
        }

        let chain = networks.filter((network) => parseInt(network.key, 16) === chainId);

        if (!chain.length) {
            return;
        }

        log(`Network switch to ${chain[0].value}`);
        setActiveNetwork(chain[0]);

        setChainSupported(supportedChainIds.indexOf(parseInt(activeNetwork.key, 16)) !== -1);
    }, [chainId, activeNetwork, supportedChainIds]);

    if (!activeNetwork) {
        return <div></div>;
    }

    return (
        <div className={`NetworkSelector ${className}`}>
            {chainSupported && activeNetwork.icon}
            {chainSupported && <span>{activeNetwork.value}</span>}
            {!chainSupported && networks[0].icon}
            {!chainSupported && <span>{networks[0].value}</span>}
            <svg
                className="NetworkSelector__Toggler"
                width="16"
                height="5"
                viewBox="0 0 16 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M1 1L8 4L15 1" stroke="#404040" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <select
                value={activeNetwork.key}
                onChange={async (e) => {
                    const selectedValue = e?.nativeEvent?.target?.value;
                    const network = networks.filter((network) => network.key === selectedValue)[0];

                    setActiveNetwork(network);

                    log(`Network switch to ${selectedValue}`);

                    if (eth && eth.request && autoChange) {
                        try {
                            await eth.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: selectedValue }],
                            });
                            debugger;
                        } catch (e) {
                            window.ethereum
                                .request({
                                    method: 'wallet_addEthereumChain',
                                    params: [
                                        {
                                            chainId: '0x38',
                                            chainName: 'Binance Smart Chain Mainnet',
                                            nativeCurrency: {
                                                name: 'Binance Coin',
                                                symbol: 'BNB',
                                                decimals: 18,
                                            },
                                            rpcUrls: ['https://bsc-dataseed1.ninicoin.io'],
                                            blockExplorerUrls: ['https://bscscan.com'],
                                        },
                                    ],
                                })
                                .catch((error) => {
                                    log(error);
                                });
                        }
                    }

                    if (onNetworkChange) {
                        onNetworkChange(network);
                    }
                }}
            >
                {availableNetworks.map((network) => (
                    <option key={network.key} value={network.key}>
                        {network.value}
                    </option>
                ))}
            </select>
        </div>
    );
};
