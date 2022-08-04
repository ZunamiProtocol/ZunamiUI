import { ReactElement, useEffect, useState } from 'react';
import './NetworkSelector.scss';
import { ReactComponent as ETHLogo } from './eth_logo.svg';
import { ReactComponent as BSCLogo } from './bsc_logo.svg';
import { log } from '../../utils/logger';

interface NetworkSelectorProps {
    onChange?: Function;
}

interface Network {
    key: string;
    value: string;
    icon: ReactElement;
}

const networks = [
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
    // {
    //   key: "0x61",
    //   value: "Smart Chain Testnet",
    //   icon: <BSCLogo />,
    // },
];

export const NetworkSelector = (props: NetworkSelectorProps): JSX.Element => {
    // const { requestNetworkSwitch } = useWallet();
    const [activeNetwork, setActiveNetwork] = useState<Network>();
    const eth = window.ethereum;
    const chainId = eth && eth.chainId;

    useEffect(() => {
        if (!chainId) {
            return;
        }

        const chain = networks.filter((network) => network.key === chainId);

        if (!chain.length) {
            setActiveNetwork({
                key: '-1',
                value: '???',
                icon: <ETHLogo />,
            });
        }

        log(`Network switch to ${chain[0].value}`);
        setActiveNetwork(chain[0]);
    }, [chainId]);

    if (!activeNetwork) {
        return <div></div>;
    }

    return (
        <div className="NetworkSelector">
            {activeNetwork.icon}
            <span>{activeNetwork.value}</span>
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
                    setActiveNetwork(
                        networks.filter((network) => network.key === selectedValue)[0]
                    );

                    log(`Network switch to ${selectedValue}`);

                    if (eth && eth.request) {
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

                    if (props.onChange) {
                        props.onChange(selectedValue);
                    }
                }}
            >
                {networks
                    .filter((item) => [1, 56].indexOf(item.id) !== -1)
                    .map((network) => (
                        <option key={network.key} value={network.key}>
                            {network.value}
                        </option>
                    ))}
            </select>
        </div>
    );
};
