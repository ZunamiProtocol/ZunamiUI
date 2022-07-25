import { ReactElement, useEffect, useState } from 'react';
import './NetworkSelector.scss';
// import { useChain } from 'react-moralis';
import useWallet from '../../hooks/useWallet';
import { ReactComponent as ETHLogo } from './eth_logo.svg';
import { ReactComponent as BSCLogo } from './bsc_logo.svg';

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

        console.log(`Network switch to ${chain[0].value}`);
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
                onChange={(e) => {
                    const selectedValue = e?.nativeEvent?.target?.value;
                    setActiveNetwork(
                        networks.filter((network) => network.key === selectedValue)[0]
                    );

                    console.log(`Network switch to ${selectedValue}`);
                    // switchNetwork(selectedValue);

                    if (eth && eth.request) {
                        eth.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: selectedValue }],
                        });
                    }

                    if (props.onChange) {
                        props.onChange(selectedValue);
                    }
                }}
            >
                {networks.map((network) => (
                    <option key={network.key} value={network.key}>
                        {network.value}
                    </option>
                ))}
            </select>
        </div>
    );
};
