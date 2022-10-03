import { useState } from 'react';
import { NetworkSelector, networks, Network } from '../NetworkSelector/NetworkSelector';
import './UnsupportedChain.scss';

interface UnsupportedChainProps {
    text: string;
}

export const UnsupportedChain = (props: UnsupportedChainProps): JSX.Element => {
    const eth = window.ethereum;
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    return (
        <div className="UnsupportedChain">
            <div className="UnsupportedChain__Content">
                <div>{props.text}</div>
                <div className="mt-3 text-center">
                    <NetworkSelector
                        className="ms-0"
                        hideActiveNetwork={true}
                        autoChange={false}
                        onNetworkChange={(network: Network) => {
                            setActiveNetwork(network);
                        }}
                    />
                    {eth && eth.request && (
                        <button
                            onClick={async () => {
                                await eth.request({
                                    method: 'wallet_switchEthereumChain',
                                    params: [{ chainId: activeNetwork.key }],
                                });
                            }}
                            className="zun-button mt-3"
                        >
                            Switch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
