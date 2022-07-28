import { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './BscMigrationModal.scss';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../../utils/formatbalance';
import { getMasterChefContract } from '../../sushi/utils';
import { useWallet } from 'use-wallet';
import useSushi from './../../hooks/useSushi';
import { BIG_ZERO } from '../../utils/formatbalance';

interface BscMigrationModalProps {
    balance: BigNumber;
    lpPrice: BigNumber;
    show: boolean;
    onWalletConnected?: Function;
    onHide?: Function;
}

const ALLOWANCE_SUM = '10000000000000000000000000';
const OLD_BSC_GATE_ADDRESS = '0x02a228D826Cbb1C0E8765A6DB6E7AB64EAA80BFD';

export const BscMigrationModal = (props: BscMigrationModalProps): JSX.Element => {
    const [result, setResult] = useState('');
    const [pending, setPending] = useState(false);
    const { account, chainId } = useWallet();
    const sushi = useSushi();
    const zunamiContract = getMasterChefContract(sushi, chainId);
    const [pendingGZLP, setPendingGZLP] = useState(false);
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const [isGZLPapproved, setGZLPapproved] = useState(false);

    useEffect(() => {
        if (!zunamiContract || !account || chainId !== 56) {
            return;
        }

        zunamiContract.options.address = OLD_BSC_GATE_ADDRESS;
        const getAllowance = async () => {
            const allowanceValue = await zunamiContract.methods
                .allowance(account, zunamiContract.options.address)
                .call();
            const allowanceBig = new BigNumber(allowanceValue);

            setAllowance(allowanceBig);
            setGZLPapproved(
                allowanceBig.isGreaterThanOrEqualTo(new BigNumber('1000000000000000000000000'))
            );
        };

        getAllowance();
        let refreshInterval = setInterval(getAllowance, 10000);
        return () => clearInterval(refreshInterval);
    }, [chainId, zunamiContract, account]);

    const handleApproveGzlp = useCallback(async () => {
        if (!zunamiContract) {
            return;
        }

        try {
            setPendingGZLP(true);
            const tx = zunamiContract.methods
                .approve(OLD_BSC_GATE_ADDRESS, ALLOWANCE_SUM)
                .send({ from: account })
                .on('transactionHash', (tx) => {
                    return tx.transactionHash;
                });
            if (!tx) {
                setPendingGZLP(false);
            }
        } catch (e) {
            setPendingGZLP(false);
        }
    }, [account, zunamiContract]);

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
                            zunamiContract.options.address = OLD_BSC_GATE_ADDRESS;

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
