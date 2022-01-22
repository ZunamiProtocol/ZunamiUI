import React, {useCallback} from 'react';
import './WalletStatus.scss';
import config from "../../config";
import {useWallet} from "use-wallet";

export const WalletStatus = (): JSX.Element => {
    // new fun
    const {CHAIN_ID} = config;
    // const {account, ethereum, connect, reset} = useWallet();

    // const handleSignOutClick = useCallback(() => {
    //     reset();
    // }, [reset]);

    // const requestNetworkSwitch = () => {
    //     // @ts-ignore
    //     const eth = window.ethereum || ethereum;

    //     setTimeout(() => {
    //         // @ts-ignore
    //         eth && eth.request && eth.request({
    //             method: 'wallet_switchEthereumChain',
    //             params: [{chainId: `0x${CHAIN_ID}`}]
    //         });
    //     }, 1000);
    // };

    // const onConnect = async () => {
    //     await connect('injected');

    //     // @ts-ignore
    //     const eth = window.ethereum || ethereum;
    //     if (!eth) {
    //         console.log('No metamask');
    //         // onPresentMetamaskModal()
    //     }

    //     requestNetworkSwitch();
    // };

    const account = '0x1FBCCba7458b78BA3Cd9F947E7d8b3977DAbC7e5';

    // if (account) {
        window.localStorage.setItem("METAMASK_ACCOUNT", account);
        const shortAddress =
            `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
        const iconVariant = document.body.classList.contains('dark') ? 'connected-wallet-icon-dark.svg' : 'connected-wallet-icon.svg';

        return (
            <div className={'WalletStatus WalletStatus__connected'}
                //  onClick={handleSignOutClick}
            >
                <div>
                    <div className="state">Connected wallet</div>
                    <span className="address">{shortAddress}</span>
                </div>
                <img src={iconVariant} alt="Wallet connected" />
            </div>
        );
    // }

    // return (
    //     <div
    //         className={'WalletStatus'}
    //         onClick={() => onConnect()}
    //     >
    //         <img src='wallet-connected-mobile.svg' alt='' className={'mobile'} />
    //         <img src='wallet.svg' alt='' className={'desktop'} />
    //         <span>Connect Wallet</span>
    //     </div>
    // );
};
