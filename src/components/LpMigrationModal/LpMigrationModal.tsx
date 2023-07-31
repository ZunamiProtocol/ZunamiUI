import { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import './LpMigrationModal.scss';
import { BigNumber } from 'bignumber.js';
import { useWallet } from 'use-wallet';
import useSushi from './../../hooks/useSushi';
import { isETH } from '../../utils/zunami';
import { log } from '../../utils/logger';
import { GAS_LIMIT_THRESHOLD } from '../../sushi/utils';

interface LpMigrationModalProps {
    balance: BigNumber;
    show: boolean;
    onHide?: Function;
}

export const LpMigrationModal = (props: LpMigrationModalProps): JSX.Element => {
    const [result, setResult] = useState('');
    const [pending, setPending] = useState(false);
    const { account, chainId } = useWallet();
    const sushi = useSushi();

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
            const zunamiContract = sushi.contracts.uzdContract;
            zunamiContract.options.from = account;
            zunamiContract.defaultAccount = account;
            const fullBalance = props.balance.toString();

            log(
                `Calling deposit('${fullBalance}', '${account}') of UZD contract ${zunamiContract.options.address}. LP → UZD migration.`
            );

            const transactionParams = {
                from: account,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null,
            };

            const estimate = await zunamiContract.methods
                .deposit(fullBalance, account)
                .estimateGas({ from: account });

            transactionParams.gas = Math.floor(estimate + estimate * GAS_LIMIT_THRESHOLD);

            await zunamiContract.methods
                .deposit(fullBalance, account)
                .send(transactionParams)
                .on('transactionHash', (transactionHash: string) => {
                    return transactionHash;
                });

            setResult(
                `LP tokens were successfully converted to UZD. Page will be reloaded in 7 seconds...`
            );

            setTimeout(() => {
                window.location.reload();
            }, 7000);
        } catch (error: any) {
            setResult(`Error while LP → UZD migration: ${error.message}`);
        }

        setPending(false);
    }, [account, chainId, sushi, props.balance]);

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
            <Modal.Body className="d-flex gap-3 flex-column justify-content-center align-items-center BscMigrationModal">
                <h3 className="text-center">ZLP → UZD Migration</h3>
                <p className="text-center">
                    The Zunami Protocol is advancing, making it easier for users to profit. In the
                    latest release, we have eliminated the USD Omni pool and discontinued support
                    for ZLP in the interface. Now, you can monitor your profitability on the new UZD
                    page and perform deposits and withdrawals seamlessly through regular swaps on
                    Curve Finance. However, you can continue using the old interface by following
                    the link -{' '}
                    <a href="https://old.zunami.io" target="_blank" rel="noreferrer">
                        old.zunami.io
                    </a>
                </p>
                <p className="panel">
                    <div className="panel-body">
                        To ensure a seamless user experience, we highly recommend converting your
                        ZLP tokens to UZD in one step.
                    </div>
                </p>
                <button
                    className={`zun-button ${pending ? 'disabled' : ''} ${
                        !isETH(chainId) ? 'hide' : ''
                    }`}
                    onClick={withdrawAll}
                >
                    Migrate
                </button>
                {result && (
                    <div className="alert alert-info" style={{ maxWidth: '350px' }}>
                        {result}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};
