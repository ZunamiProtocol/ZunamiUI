import React, { useState, useCallback, useEffect } from 'react';
import './WalletButton.scss';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { networks, Network } from '../NetworkSelector/NetworkSelector';
import { WalletsModal } from '../WalletsModal/WalletsModal';
import { getChainClient } from '../../utils/zunami';
import { Address, GetEnsNameReturnType } from 'viem';
import llamasAbi from '../../actions/abi/llama/llamas_factory.json';

interface WalletButtonProps {}

export const TheLlamas: Address = '0xe127ce638293fa123be79c25782a5652581db234';

export const WalletButton = (
    props: WalletButtonProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const { disconnect } = useDisconnect();
    const { address: account } = useAccount();
    const [activeNetwork, setActiveNetwork] = useState<Network>(networks[0]);
    const [chainSupported, setChainSupported] = useState(false);
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : 1;

    const [nftUrl, setNftUrl] = useState<string>('');

    useEffect(() => {
        async function getNFT() {
            if (!account || chainId !== 1) {
                setNftUrl('');
                return '';
            }

            const tokens = await getChainClient(chainId).readContract({
                address: TheLlamas,
                abi: llamasAbi,
                functionName: 'tokensForOwner',
                args: [account],
                // args: ['0x62c8aCc91b488F5749D8e43C7711eDf76841b206'],
            });

            // @ts-ignore
            if (tokens.length === 0) {
                setNftUrl('');
                return;
            }

            const tokenUri = await getChainClient(chainId).readContract({
                address: TheLlamas,
                abi: llamasAbi,
                functionName: 'tokenURI',
                // @ts-ignore
                args: [tokens[0]],
            });

            // @ts-ignore
            const tokenResp = await fetch(tokenUri);
            const token = (await tokenResp.json()) as { image: string };

            // @ts-ignore
            setNftUrl(token.image);
        }

        getNFT();
    }, [account, chainId]);

    const [ensName, setEnsName] = useState<GetEnsNameReturnType>('');

    useEffect(() => {
        async function getName() {
            if (!account) {
                return '';
            }

            setEnsName(
                await getChainClient().getEnsName({
                    address: account,
                })
            );
        }

        getName();
    }, [account]);

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
        ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}`
        : '';

    return (
        <React.Fragment>
            <button
                id="connect-wallet-btn"
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
                {!nftUrl && account && (
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
                )}

                {!account && (
                    <svg
                        height="512"
                        viewBox="0 0 512 512"
                        width="512"
                        xmlns="http://www.w3.org/2000/svg"
                        className="plus"
                    >
                        <rect
                            height="288"
                            rx="48"
                            ry="48"
                            fill="none"
                            stroke="#000"
                            strokeWidth={36}
                            // style="fill:none;stroke:#000;stroke-linejoin:round;stroke-width:32px"
                            width="416"
                            x="48"
                            y="144"
                        />
                        <path
                            d="M411.36,144V114A50,50,0,0,0,352,64.9L88.64,109.85A50,50,0,0,0,48,159v49"
                            fill="none"
                            stroke="#000"
                            strokeWidth={36}
                            // style="fill:none;stroke:#000;stroke-linejoin:round;stroke-width:32px"
                        />
                        <path d="M368,320a32,32,0,1,1,32-32A32,32,0,0,1,368,320Z" />
                    </svg>
                )}
                {!account && <span className="add-wallet-label">Add wallet</span>}

                {account && nftUrl && <img src={nftUrl} alt="TheLLAMAS" className="nft" />}

                {account && (
                    <span id="address" className="address">
                        {ensName ? ensName : shortAddress}
                    </span>
                )}
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
