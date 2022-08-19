import { useState } from 'react';
import { NetworkSelector, networks, Network } from '../NetworkSelector/NetworkSelector';
import './UnsupportedChain.scss';

export const UnsupportedChain = (): JSX.Element => {
    const eth = window.ethereum;
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);

    return (
        <div className="UnsupportedChain">
            <div className="UnsupportedChain__Content">
                <div>
                    You're using unsupported chain. Please, switch either to Ethereum or Binance
                    network.
                </div>
                <div className="mt-3 text-center">
                    <NetworkSelector
                        className="ms-0"
                        defaultNetwork={activeNetwork}
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
