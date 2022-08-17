import './UnsupportedChain.scss';

export const UnsupportedChain = (): JSX.Element => {
    const eth = window.ethereum;

    return (
        <div className="UnsupportedChain">
            <div className="UnsupportedChain__Content">
                <div>
                    You're using unsupported chain. Please, switch either to Ethereum or Binance
                    network.
                </div>
                <div className="mt-3">
                    {eth && eth.request && (
                        <button
                            onClick={async () => {
                                await eth.request({
                                    method: 'wallet_switchEthereumChain',
                                    params: [{ chainId: '0x1' }],
                                });
                            }}
                            className="zun-button"
                        >
                            Change network
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
