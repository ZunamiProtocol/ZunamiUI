import { useState, useCallback } from 'react';
import './WalletStatus.scss';
import { useWallet } from 'use-wallet';
import { WalletsModal } from '../WalletsModal/WalletsModal';

export const LS_ACCOUNT_KEY = 'METAMASK_ACCOUNT';
export const LS_WALLET_TYPE_KEY = 'WALLET_TYPE';

export const WalletStatus = (): JSX.Element => {
    const { account, reset } = useWallet();

    const handleSignOutClick = useCallback(() => {
        reset();
        window.localStorage.clear();
    }, [reset]);

    const [show, setShow] = useState(false);

    if (account) {
        const shortAddress = `${account.substring(0, 6)}...${account.substring(
            account.length - 4
        )}`;

        return (
            <div className={'WalletStatus WalletStatus__connected'}>
                <div>
                    <div className="state">Connected wallet</div>
                    <span className="address" onClick={handleSignOutClick}>
                        {shortAddress}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={'WalletStatus'}>
            <WalletsModal
                show={show}
                onHide={() => {
                    setShow(false);
                }}
                onWalletConnected={(wallet: any) => {
                    window.localStorage.setItem(LS_ACCOUNT_KEY, wallet.address);
                }}
            />
            <input
                type="button"
                className="WalletStatus__Connect"
                value="Connect wallet"
                onClick={() => setShow(true)}
            />
        </div>
    );
};
