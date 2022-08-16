import './UnsupportedChain.scss';

export const UnsupportedChain = (): JSX.Element => {
    return (
        <div className="UnsupportedChain">
            <div className="UnsupportedChain__Content">
                You're using unsupported chain. Please, switch either to Ethereum or Binance
                network.
            </div>
        </div>
    );
};
