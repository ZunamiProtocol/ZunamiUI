import React, { useState, useCallback, useEffect } from 'react';
import './WalletButton.scss';
import { useConnect, useAccount, useNetwork, useDisconnect } from 'wagmi';
import { networks, Network } from '../NetworkSelector/NetworkSelector';
import { WalletsModal } from '../WalletsModal/WalletsModal';

interface WalletButtonProps {}

export const WalletButton = (
    props: WalletButtonProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { address: account, isConnected } = useAccount();
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    const [open, setOpen] = useState(false);
    const eth = window.ethereum;
    const [chainSupported, setChainSupported] = useState(false);
    const networksList = networks;
    const availableNetworks = networksList.filter(
        (item) => [1, 56, 137].indexOf(parseInt(item.key, 16)) !== -1
    );
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : 1;

    useEffect(() => {
        if (!chainId) {
            return;
        }

        const defaultNetwork = networks.filter(
            (network) => parseInt(network.key, 16) === chainId
        )[0];

        setActiveNetwork(defaultNetwork);
    }, [chainId, activeNetwork]);

    const handleSignOutClick = useCallback(() => {
        window.localStorage.clear();
        disconnect();
    }, []);

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!chainId) {
            return;
        }

        const supportedChainIds = [1, 56, 137];

        const defaultNetwork = networks.filter(
            (network) => parseInt(network.key, 16) === chainId
        )[0];

        // if (!hideActiveNetwork) {
        setActiveNetwork(defaultNetwork);
        // }

        if (!activeNetwork) {
            setChainSupported(false);
            return;
        }

        setChainSupported(supportedChainIds.indexOf(parseInt(activeNetwork.key, 16)) !== -1);
    }, [chainId, activeNetwork]);

    const shortAddress = account
        ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
        : '';

    return (
        <React.Fragment>
            <button
                className={`WalletButton WalletButton-${
                    account ? 'connected' : 'disconnected'
                } btn btn-light`}
                onClick={() => {
                    if (account) {
                        handleSignOutClick();
                    } else {
                        setShow(true);
                    }
                }}
            >
                {!account && <span>Add wallet</span>}
                <svg
                    width="31"
                    height="34"
                    viewBox="0 0 31 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon"
                >
                    <rect
                        width="29.4764"
                        height="15.1826"
                        rx="7.59128"
                        transform="matrix(0.906468 -0.422275 0.460417 0.887703 -7.16284 12.9512)"
                        fill="#B8B8B8"
                    />
                    <rect
                        width="32.9484"
                        height="23.8058"
                        rx="9"
                        transform="matrix(0.981346 -0.192248 0.213865 0.976863 -7 11.3916)"
                        fill="#D5D5D5"
                    />
                </svg>

                {!account && (
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="plus"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13 6.5C13 10.0899 10.0899 13 6.5 13C2.91015 13 0 10.0899 0 6.5C0 2.91015 2.91015 0 6.5 0C10.0899 0 13 2.91015 13 6.5ZM3.02632 7.125V5.87842H5.87228V3.02869H7.11885V5.87842H9.97153V7.125H7.11885V9.97389H5.87228V7.125H3.02632Z"
                            fill="black"
                        />
                    </svg>
                )}
                {account && <span className="address">{shortAddress}</span>}
            </button>
            <WalletsModal
                show={show}
                onHide={() => {
                    setShow(false);
                }}
                onWalletConnected={() => {
                    setShow(false);
                }}
            />
        </React.Fragment>
    );
};
