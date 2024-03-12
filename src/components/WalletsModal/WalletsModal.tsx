import { Modal } from 'react-bootstrap';
import config from '../../config';
import { useConnect, useAccount, useNetwork, Connector } from 'wagmi';
import './WalletsModal.scss';
import { log } from '../../utils/logger';
import { rabbyKit } from '../../index';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';

export const LS_ACCOUNT_KEY = 'WALLET_ACCOUNT';
export const LS_WALLET_TYPE_KEY = 'wagmi.wallet';

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
    const { connect, connectors } = useConnect();
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? parseInt(window.ethereum?.chainId, 16) : 1;
    const isEth = chainId === 1;

    const onConnect = async (providerId = 'injected') => {
        let walletAddress = '';
        let connector: Array<Connector<any, any>> = [];

        switch (providerId) {
            case 'injected':
                connector = connectors.filter((item) => item.id === 'metaMask');
                break;
            case 'walletconnect':
                connector = connectors.filter((item) => item.id === 'walletConnect');
                break;
            case 'coinbase':
                connector = connectors.filter((item) => item.id === 'coinbaseWallet');
                break;
            case 'zerion':
                connector = connectors.filter((item) => item.id === 'walletConnect');
                break;
        }

        // @ts-ignore
        const eth = window.ethereum;

        if (!eth && providerId === 'injected') {
            connector = [new MetaMaskConnector()];
        }

        if (connector.length) {
            connect({ connector: connector[0] });
        } else {
            alert(
                `No suitable connector for ${providerId} was found. Make sure you wallet extension connected.`
            );
        }

        window.localStorage.setItem(LS_ACCOUNT_KEY, walletAddress);

        // if (!eth && providerId === 'injected') {
        //     alert(NO_METAMASK_WARNING);
        // }

        // @ts-ignore
        if (window.dataLayer) {
            // @ts-ignore
            window.dataLayer.push({
                event: 'login',
                userID: getActiveWalletAddress(),
                type: getActiveWalletName(),
            });
        }

        if (props.onWalletConnected) {
            props.onWalletConnected({
                type: getActiveWalletName(),
                address: getActiveWalletAddress(),
            });
        }
    };

    return (
        <Modal
            show={props.show}
            onHide={() => {
                if (props.onHide) {
                    props.onHide();
                }
            }}
            backdrop="static"
            animation={false}
            keyboard={false}
            centered
            className="WalletsModalWrapper"
            id="select-wallets-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Connect a wallet</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-row flex-wrap WalletsModal  justify-content-center align-items-center">
                {window.ethereum && (
                    <button
                        id="connect-metamask-btn"
                        onClick={() => onConnect('injected')}
                        className="d-inline-flex flex-column bg-transparent metamask"
                    >
                        <img src="/metamask.svg" alt="" />
                        <span className="name">Metamask Wallet</span>
                        <span className="connect">Connect</span>
                    </button>
                )}
                <button
                    onClick={() => onConnect('walletconnect')}
                    className="d-inline-flex flex-column bg-transparent walletconnect"
                >
                    <img src="/wallet-connect.svg" alt="" />
                    <span className="name">Wallet Connect</span>
                    <span className="connect">Connect</span>
                </button>
                <button
                    onClick={() => onConnect('coinbase')}
                    className={`d-inline-flex flex-column bg-transparent coinbase ${
                        !isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/wallet-link.svg" alt="" />
                    <span className="name">Coinbase Wallet</span>
                    {/* {isEth && <span className="badge bg-secondary">only ETH</span>} */}
                    {isEth && <span className="connect">Connect</span>}
                </button>
                <button
                    onClick={() => onConnect('walletconnect')}
                    className={`d-inline-flex flex-column bg-transparent zerion ${
                        !isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/zerion-wallet.svg" alt="" />
                    <span className="name">Zerion Wallet</span>
                    {/* {isEth && <span className="badge bg-secondary">only ETH</span>} */}
                    {isEth && <span className="connect">Connect</span>}
                </button>
                <button
                    onClick={() => {
                        rabbyKit.subscribeModalState((open) => {
                            if (!open) {
                                props.onHide();
                            }
                        });
                        rabbyKit.open();
                    }}
                    className={`d-inline-flex flex-column bg-transparent rabby ${
                        !isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/rabby.svg" alt="" />
                    <span className="name">Rabby Wallet</span>
                    {isEth && <span className="connect">Connect</span>}
                </button>
                <button
                    onClick={() => {
                        rabbyKit.subscribeModalState((open) => {
                            if (!open) {
                                props.onHide();
                            }
                        });
                        rabbyKit.open();
                    }}
                    className={`d-inline-flex flex-column bg-transparent frame ${
                        !isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/frame.png" alt="" />
                    <span className="name">Frame Wallet</span>
                    {isEth && <span className="connect">Connect</span>}
                </button>
            </Modal.Body>
        </Modal>
    );
};
