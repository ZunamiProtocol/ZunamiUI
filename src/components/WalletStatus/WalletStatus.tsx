import { useState, useCallback, useEffect } from 'react';
import './WalletStatus.scss';
import { useWallet } from 'use-wallet';
import { WalletsModal } from '../WalletsModal/WalletsModal';
import { log } from '../../utils/logger';
import { networks, Network } from '../NetworkSelector/NetworkSelector';

export const WalletStatus = (): JSX.Element => {
    const { account, reset, chainId } = useWallet();
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);

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
        reset();
        window.localStorage.clear();
    }, [reset]);

    const [show, setShow] = useState(false);

    if (account) {
        const shortAddress = `${account.substring(0, 6)}...${account.substring(
            account.length - 4
        )}`;

        log(`Active wallet: ${account}`);

        return (
            <div className={'WalletStatus mt-4 WalletStatus__connected'}>
                <div className="WalletStatus__inner">
                    <div className="WalletStatus__inner__network">
                        {activeNetwork.icon}
                        <span>{activeNetwork.value}</span>
                    </div>
                    <div className="WalletStatus__inner__wallet">
                        <div className="state">Connected wallet</div>
                        <span className="address">
                            {shortAddress}
                        </span>
                    </div>
                    <div>
                        <button className="btn btn-light btn-sm d-flex align-items-center">
                            Change network
                        </button>
                    </div>
                    <div>
                        <button className="btn btn-light btn-sm d-flex align-items-center" onClick={handleSignOutClick}>
                            Log out
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className={'WalletStatus mt-5'}>
            <WalletsModal
                show={show}
                onHide={() => {
                    setShow(false);
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
