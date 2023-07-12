import { Modal } from 'react-bootstrap';
import './WalletsModal.scss';
import { useConnect, useNetwork } from 'wagmi';

export const LS_ACCOUNT_KEY = 'WALLET_ACCOUNT';
export const LS_WALLET_TYPE_KEY = 'WALLET_TYPE';

export const NO_METAMASK_WARNING =
    'Please, install either Metamask browser extension or Metamask mobile app';

export function getActiveWalletName() {
    let name = window.localStorage.getItem(LS_WALLET_TYPE_KEY);

    return name === 'injected' ? 'metamask' : name;
}

export function getActiveWalletAddress() {
    return window.localStorage.getItem(LS_ACCOUNT_KEY);
}

interface WalletModalProps {
    show: boolean;
    onWalletConnected?: Function;
    onHide: Function;
}

export const WalletsModal = (props: WalletModalProps): JSX.Element => {
    const { chain } = useNetwork();
    const isEth = chain && chain.id === 1;
    const { connect, connectors } = useConnect();

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            backdrop="static"
            animation={false}
            keyboard={false}
            centered
            className="WalletsModalWrapper"
        >
            <Modal.Header closeButton>
                <Modal.Title>Connect a wallet</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-row flex-wrap WalletsModal  justify-content-center align-items-center">
                <button
                    onClick={() => connect({ connector: connectors[0] })}
                    className="d-inline-flex flex-column bg-transparent metamask"
                >
                    <img src="/metamask.svg" alt="" />
                    <span className="name">Metamask Wallet</span>
                    <span className="connect">Connect</span>
                </button>
                <button
                    onClick={() => connect({ connector: connectors[2] })}
                    className="d-inline-flex flex-column bg-transparent walletconnect"
                >
                    <img src="/wallet-connect.svg" alt="" />
                    <span className="name">Wallet Connect</span>
                    <span className="connect">Connect</span>
                </button>
                <button
                    onClick={() => connect({ connector: connectors[2] })}
                    className={`d-inline-flex flex-column bg-transparent coinbase ${
                        isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/wallet-link.svg" alt="" />
                    <span className="name">Coinbase Wallet</span>
                    {isEth && <span className="badge bg-secondary">only ETH</span>}
                    {!isEth && <span className="connect">Connect</span>}
                </button>
                <button
                    onClick={() => connect({ connector: connectors[2] })}
                    className={`d-inline-flex flex-column bg-transparent zerion ${
                        isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/zerion-wallet.svg" alt="" />
                    <span className="name">Zerion Wallet</span>
                    {isEth && <span className="badge bg-secondary">only ETH</span>}
                    {!isEth && <span className="connect">Connect</span>}
                </button>
            </Modal.Body>
        </Modal>
    );
};
