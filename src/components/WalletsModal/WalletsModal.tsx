import { Modal } from 'react-bootstrap';
import config from '../../config';
import { useWallet } from 'use-wallet';
import './WalletsModal.scss';
import { log } from '../../utils/logger';

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
    const { ethereum, connect } = useWallet();
    const eth = window.ethereum || ethereum;
    const isEth = eth && eth.chainId !== '0x1';
    const onConnect = async (providerId = 'injected') => {
        try {
            log(`🔑 Attempt to connect wallet (provider ID is "${providerId}")`);
            await connect(providerId);
        } catch (connectionError: any) {
            log(`❗️ Error connecting wallet: ${connectionError.message}`);
        }

        window.localStorage.setItem(LS_WALLET_TYPE_KEY, providerId);
        let walletAddress = '';

        switch (providerId) {
            case 'injected':
                walletAddress = window.localStorage.getItem('LAST_ACTIVE_ACCOUNT') || '';
                break;
            case 'walletlink':
                walletAddress =
                    window.localStorage.getItem(
                        '-walletlink:https://www.walletlink.org:Addresses'
                    ) || '';
                break;
            case 'walletconnect':
                const wcStorage = JSON.parse(window.localStorage.getItem('walletconnect') || '{}');
                if (wcStorage?.accounts && wcStorage.accounts[0]) {
                    walletAddress = wcStorage.accounts[0];
                }
                break;
        }

        window.localStorage.setItem(LS_ACCOUNT_KEY, walletAddress);

        // @ts-ignore
        const eth = window.ethereum || ethereum;

        if (!eth && providerId === 'injected') {
            alert(NO_METAMASK_WARNING);
        }

        // @ts-ignore
        if (window.dataLayer) {
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
            <Modal.Body className="d-flex gap-3 flex-row justify-content-center align-items-start flex-wrap WalletsModal">
                <button
                    onClick={() => onConnect('injected')}
                    className="border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent"
                >
                    <img src="/metamask.svg" alt="" />
                    <span className="mt-2">Metamask</span>
                </button>
                <button
                    onClick={() => onConnect('walletconnect')}
                    className="border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent"
                >
                    <img src="/wallet-connect.svg" alt="" />
                    <span className="mt-2">Wallet Connect</span>
                </button>
                <button
                    onClick={() => onConnect('walletlink')}
                    className={`border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent ${
                        isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/wallet-link.svg" alt="" />
                    <span className="mt-2">Coinbase Wallet</span>
                    {isEth && <span className="badge bg-secondary">only Ethereum</span>}
                </button>
                <button
                    onClick={() => onConnect('walletconnect')}
                    className={`border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent ${
                        isEth ? 'disabled' : ''
                    }`}
                >
                    <img src="/zerion-wallet.svg" alt="" />
                    <span className="mt-2">Zerion Wallet</span>
                    {isEth && <span className="badge bg-secondary">only Ethereum</span>}
                </button>
            </Modal.Body>
        </Modal>
    );
};
