import { useMemo, useState } from 'react';
import { NetworkSelector, networks, Network } from '../NetworkSelector/NetworkSelector';
import './UnsupportedChain.scss';
import { mainnet, sepolia, useNetwork } from 'wagmi';

interface UnsupportedChainProps {
    text: string;
    customNetworksList?: Array<Network>;
}

export const UnsupportedChain = (props: UnsupportedChainProps): JSX.Element => {
    const eth = window.ethereum;
    const { chain } = useNetwork();
    const chainId: number = chain ? chain.id : 1;
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    const networksList = props.customNetworksList ? props.customNetworksList : undefined;

    const showModal = useMemo(() => {
        // @ts-ignore
        return [mainnet.id, sepolia.id].indexOf(chainId) === -1;
    }, [chainId]);

    return (
        <div className={`UnsupportedChain ${!showModal ? 'hide' : ''}`}>
            <div className="UnsupportedChain__Content">
                <p>{props.text}</p>
                <div className="mt-3 text-center">
                    <NetworkSelector
                        className="ms-0"
                        hideActiveNetwork={true}
                        autoChange={false}
                        customNetworksList={networksList}
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
                            className="zun-button"
                        >
                            Switch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
