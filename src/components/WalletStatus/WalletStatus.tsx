import React, { useState } from 'react';
import { connectWallet, getSelectedWalletAddress } from '../../actions/MetamaskActions';
import './WalletStatus.scss';

export const WalletStatus = (): JSX.Element => {
    const [address, setAddress] = useState(getSelectedWalletAddress());

    if (address) {
        const shortAddress = 
            `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

        return (
            <div className={'WalletStatus WalletStatus__connected'}>
                <img src='wallet-connected.svg' alt='' />
                <span>{shortAddress}</span>
            </div>
        );
    }

    return (
        <div
            className={'WalletStatus'}
            onClick={async () => {
                setAddress(await connectWallet());
            }}
        >
            <img src='wallet.svg' alt='' />
            <span className={'d-none d-sm-block'}>Connect Wallet</span>
        </div>
    );
};
