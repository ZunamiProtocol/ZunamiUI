import { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import './BscMigrationModal.scss';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../../utils/formatbalance';
import { getMasterChefContract } from '../../sushi/utils';
import { useWallet } from 'use-wallet';
import useSushi from './../../hooks/useSushi';
import { useGzlpAllowance } from '../../hooks/useGzlpAllowance';
import useApprove from '../../hooks/useApprove';

interface BscMigrationModalProps {
    balance: BigNumber;
    lpPrice: BigNumber;
    show: boolean;
    onWalletConnected?: Function;
    onHide?: Function;
}

export const BscMigrationModal = (props: BscMigrationModalProps): JSX.Element => {
    const [result, setResult] = useState('');
    const [pending, setPending] = useState(false);
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi, chainId);
    const [pendingGZLP, setPendingGZLP] = useState(false);
    const gzlpAllowance = useGzlpAllowance();
    const { onGZLPApprove } = useApprove();

    const isGZLPapproved = gzlpAllowance.isGreaterThanOrEqualTo(
        new BigNumber('10000000000000000000000000')
    );

    const handleApproveGzlp = useCallback(async () => {
        try {
            setPendingGZLP(true);
            const tx = onGZLPApprove();
            if (!tx) {
                setPendingGZLP(false);
            }
        } catch (e) {
            setPendingGZLP(false);
        }
    }, [onGZLPApprove]);

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
                <h3 className="text-center">
                    Zunami BSC Gateway v1.0 is outdated, you need to migrate to Zunami BSC Gateway
                    v1.1
                </h3>
                <p className="text-center">
                    We apologize, but in order to continue using the protocol, you will need to
                    withdraw funds from the outdated version and deposit them again. Don't worry!
                    Your funds and income are saved. Funds will be withdrawn within 24 hours.
                </p>
                <InfoBlock
                    title="Balance"
                    description={`$ ${getBalanceNumber(props.balance.multipliedBy(props.lpPrice))
                        .toNumber()
                        .toLocaleString('en')}`}
                    withColor={true}
                    isStrategy={false}
                    colorfulBg={true}
                />
                {!isGZLPapproved && (
                    <button
                        className={`zun-button ${pendingGZLP ? 'disabled' : ''}`}
                        onClick={handleApproveGzlp}
                    >
                        Approve GZLP
                    </button>
                )}
                <button
                    className={`zun-button ${pending ? 'disabled' : ''} ${
                        !isGZLPapproved ? 'hide' : ''
                    }`}
                    onClick={async () => {
                        try {
                            setPending(true);
                            // OLD DEPRECATED BSC GATEWAY. DO NOT USE
                            zunamiContract.options.address =
                                '0x02a228D826Cbb1C0E8765A6DB6E7AB64EAA80BFD';

                            await zunamiContract.methods
                                .delegateWithdrawal(props.balance.toFixed(0).toString())
                                .send({ from: account })
                                .on('transactionHash', (transactionHash) => {
                                    return transactionHash;
                                });

                            setResult(
                                `Success! Funds will be withdrawn within 24 hours. Page will be reloaded in 7 seconds...`
                            );
                            setTimeout(() => {
                                window.location.reload();
                            }, 7000);
                        } catch (error: any) {
                            debugger;
                            setResult(`Error while withdraw: ${error.message}`);
                        }

                        setPending(false);
                    }}
                >
                    Withdraw all
                </button>
                {result && <div className="alert alert-info">{result}</div>}
            </Modal.Body>
        </Modal>
    );
};
