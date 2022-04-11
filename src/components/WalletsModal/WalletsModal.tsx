import { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import config from '../../config';
import { useWallet } from 'use-wallet';

export const LS_ACCOUNT_KEY = 'METAMASK_ACCOUNT';
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
    onWalletConnected: Function;
    onHide: Function;
}

export const WalletsModal = (props: WalletModalProps): JSX.Element => {
    const { CHAIN_ID } = config;
    const { account, ethereum, connect } = useWallet();
    const eth = window.ethereum || ethereum;

    const requestNetworkSwitch = () => {
        // @ts-ignore

        setTimeout(() => {
            // @ts-ignore
            eth &&
                eth.request &&
                eth.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${CHAIN_ID}` }],
                });
        }, 1000);
    };

    if (eth) {
        requestNetworkSwitch();
    }

    const onConnect = async (providerId = 'injected') => {
        await connect(providerId);

        window.localStorage.setItem(LS_WALLET_TYPE_KEY, providerId);

        if (account) {
            window.localStorage.setItem(LS_ACCOUNT_KEY, account);
        }

        // @ts-ignore
        const eth = window.ethereum || ethereum;

        if (!eth && providerId === 'injected') {
            alert(NO_METAMASK_WARNING);
        }

        if (eth) {
            requestNetworkSwitch();
        }

        // @ts-ignore
        window.dataLayer.push({
            event: 'login',
            userID: getActiveWalletAddress(),
            type: getActiveWalletName(),
        });

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
        >
            <Modal.Header closeButton>
                <Modal.Title>Connect a wallet</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-row justify-content-center align-items-center">
                <button
                    onClick={() => onConnect('injected')}
                    className="border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent"
                >
                    <img src="/metamask.svg" alt="" />
                    <span className="mt-1">Metamask</span>
                </button>
                <button
                    onClick={() => onConnect('walletconnect')}
                    className="border-0 d-inline-flex flex-column justify-content-center align-items-center bg-transparent"
                >
                    <img src="/wallet-connect.svg" alt="" />
                    <span className="mt-1">Wallet Connect</span>
                </button>
            </Modal.Body>
        </Modal>
    );
};
