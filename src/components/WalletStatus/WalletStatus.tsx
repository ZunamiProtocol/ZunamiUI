import React, { useCallback } from 'react';
import './WalletStatus.scss';
import config from '../../config';
import { useWallet } from 'use-wallet';

export const WalletStatus = (): JSX.Element => {
    const { CHAIN_ID } = config;
    const { account, ethereum, connect, reset } = useWallet();

    const handleSignOutClick = useCallback(() => {
        reset();
    }, [reset]);

    const requestNetworkSwitch = () => {
        // @ts-ignore
        const eth = window.ethereum || ethereum;

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

    const onConnect = async () => {
        await connect('injected');

        // @ts-ignore
        const eth = window.ethereum || ethereum;
        if (!eth) {
            console.log('No metamask');
            // onPresentMetamaskModal()
        }

        requestNetworkSwitch();
    };

    if (account) {
        window.localStorage.setItem('METAMASK_ACCOUNT', account);
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
                <svg
                    className="WalletStatus__Icon"
                    viewBox="0 0 55 43"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3.98987 6.41834L36.5667 0.116214C37.4868 -0.06214 38.4349 -0.0349216 39.3432 0.195921C40.2515 0.426765 41.0975 0.855525 41.8208 1.45152C42.544 2.04752 43.1266 2.79601 43.5268 3.64344C43.927 4.49088 44.135 5.41629 44.1357 6.35347V28.3572L17.0624 37.5965L3.98987 6.41834Z"
                        fill="#F2E7C9"
                    />
                    <path
                        d="M6.6447 5.79773H47.8386C49.5994 5.79988 51.2875 6.50089 52.5318 7.74678C53.7762 8.99267 54.4752 10.6815 54.4752 12.4424V36.3617C54.473 38.1214 53.7732 39.8084 52.5291 41.0528C51.285 42.2973 49.5982 42.9976 47.8386 43.0003H6.6447C4.88363 42.9998 3.19476 42.3004 1.94893 41.0557C0.703096 39.811 0.00214821 38.1228 0 36.3617L0 12.4424C0 10.6801 0.700064 8.99004 1.94619 7.74392C3.19231 6.49779 4.88241 5.79773 6.6447 5.79773Z"
                        fill="#F5EDD6"
                    />
                    <path
                        d="M27.0179 30.3504C26.1785 31.2157 24.8594 31.2157 24.0201 30.3504L19.3834 25.5705C18.5441 24.7052 18.5441 23.3454 19.3834 22.4801C20.2228 21.6147 21.5419 21.6147 22.3813 22.4801L25.1392 25.3233C25.3391 25.5293 25.6988 25.5293 25.8987 25.3233L33.3732 17.6177C34.2126 16.7524 35.5316 16.7524 36.371 17.6177C36.7707 18.0298 37.0105 18.5655 37.0105 19.1836C37.0105 19.8017 36.7707 20.3373 36.371 20.7494L27.0179 30.3504Z"
                        fill="white"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div className={'WalletStatus'} onClick={() => onConnect()}>
            <input type="button" className="WalletStatus__Connect" value="Connect wallet" />
            <svg
                className="WalletStatus__Icon"
                viewBox="0 0 55 43"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3.98987 6.41834L36.5667 0.116214C37.4868 -0.06214 38.4349 -0.0349216 39.3432 0.195921C40.2515 0.426765 41.0975 0.855525 41.8208 1.45152C42.544 2.04752 43.1266 2.79601 43.5268 3.64344C43.927 4.49088 44.135 5.41629 44.1357 6.35347V28.3572L17.0624 37.5965L3.98987 6.41834Z"
                    fill="#F2E7C9"
                />
                <path
                    d="M6.6447 5.79785H47.8386C49.5994 5.8 51.2875 6.50101 52.5318 7.7469C53.7762 8.99279 54.4752 10.6817 54.4752 12.4425V36.3618C54.473 38.1215 53.7732 39.8085 52.5291 41.053C51.285 42.2974 49.5982 42.9978 47.8386 43.0004H6.6447C4.88363 42.9999 3.19476 42.3005 1.94893 41.0558C0.703096 39.8111 0.00214821 38.1229 0 36.3618L0 12.4425C0 10.6803 0.700064 8.99016 1.94619 7.74404C3.19231 6.49792 4.88241 5.79785 6.6447 5.79785Z"
                    fill="#F5EDD6"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M27.5 15C26.3954 15 25.5 15.8954 25.5 17V22.5H20C18.8954 22.5 18 23.3954 18 24.5C18 25.6046 18.8954 26.5 20 26.5H25.5V32C25.5 33.1046 26.3954 34 27.5 34C28.6046 34 29.5 33.1046 29.5 32V26.5H35C36.1046 26.5 37 25.6046 37 24.5C37 23.3954 36.1046 22.5 35 22.5H29.5V17C29.5 15.8954 28.6046 15 27.5 15Z"
                    fill="white"
                />
            </svg>
        </div>
    );
};
