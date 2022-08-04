import './UnsupportedChain.scss';

export const UnsupportedChain = (): JSX.Element => {
    return (
        <div className="UnsupportedChain">
            <div>
                You're using unsupported chain. Please, switch either to Ethereum or Binance
                network.
            </div>
        </div>
    );
};
