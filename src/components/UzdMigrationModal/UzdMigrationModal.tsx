import { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import './UzdMigrationModal.scss';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../../utils/formatbalance';
import { useWallet } from 'use-wallet';
import useSushi from './../../hooks/useSushi';
import { isBSC, isETH } from '../../utils/zunami';
import { contractAddresses } from '../../sushi/lib/constants';
import { log } from '../../utils/logger';

interface UzdMigrationModalProps {
    balance: BigNumber;
    show: boolean;
    onWalletConnected?: Function;
    onHide?: Function;
}

export const UzdMigrationModal = (props: UzdMigrationModalProps): JSX.Element => {
    const [result, setResult] = useState('');
    const [pending, setPending] = useState(false);
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    const eth = window.ethereum;

    const withdrawAll = useCallback(async () => {
        if (!account || !chainId) {
            return;
        }

        try {
            if (!isETH(chainId)) {
                alert('Switch to ETH network to continue');
                return;
            }

            setPending(true);
            // OLD DEPRECATED UZD contract. DO NOT USE
            const zunamiContract = sushi.contracts.uzdContract;
            zunamiContract.options.address = contractAddresses.deprecated.v_1_0_uzd;
            zunamiContract.options.from = account;
            zunamiContract.defaultAccount = account;

            log(
                `Calling withdrawAll('${account}', '${contractAddresses.deprecated.v_1_0_uzd}') on old USD contract`
            );

            await zunamiContract.methods
                .withdrawAll(account, account)
                .send({ from: account })
                .on('transactionHash', (transactionHash: string) => {
                    return transactionHash;
                });

            setResult(
                `UZD coins were successfully withdrwawn. Page will be reloaded in 7 seconds...`
            );

            setTimeout(() => {
                window.location.reload();
            }, 7000);
        } catch (error: any) {
            setResult(`Error while deprecated UZD withdrawAll: ${error.message}`);
        }

        setPending(false);
    }, [account, chainId, sushi]);

    return (
        <Modal
            show={props.show}
            backdrop="static"
            animation={false}
            keyboard={false}
            centered
            onHide={() => {
                if (props.onHide) {
                    props.onHide();
                }
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-column justify-content-center align-items-center BscMigrationModal">
                <h3 className="text-center">It's time to migrate to Zunami UZD v1.1</h3>
                <p className="text-center">
                    We apologize, but in order to continue using the protocol, you will need to
                    withdraw funds from the outdated version and deposit them again. Don't worry!
                    Your funds and income are saved.
                </p>
                <InfoBlock
                    title="Balance"
                    description={`$ ${getBalanceNumber(props.balance)
                        .toNumber()
                        .toLocaleString('en')}`}
                    withColor={true}
                    isStrategy={false}
                    colorfulBg={true}
                />
                <button
                    className={`zun-button ${pending ? 'disabled' : ''} ${
                        isBSC(chainId) ? 'hide' : ''
                    }`}
                    onClick={withdrawAll}
                >
                    Withdraw all
                </button>
                {!isETH(chainId) && (
                    <div className="alert alert-warning text-center">
                        Please, switch to Ethereum network.
                        <button
                            className="zun-button mt-2"
                            onClick={async () => {
                                await eth.request({
                                    method: 'wallet_switchEthereumChain',
                                    params: [{ chainId: '0x1' }],
                                });
                                window.location.reload();
                            }}
                        >
                            Switch to Ethereum
                        </button>
                    </div>
                )}
                {result && <div className="alert alert-info">{result}</div>}
            </Modal.Body>
        </Modal>
    );
};
