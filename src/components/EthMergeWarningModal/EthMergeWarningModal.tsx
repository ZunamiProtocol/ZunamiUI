import { Modal } from 'react-bootstrap';
import './EthMergeWarningModal.scss';
import { ReactComponent as DepositIcon } from '../Header/NavMenu/deposit-icon.svg';

interface EthMergeWarningModalProps {
    show: boolean;
}

export const EthMergeWarningModal = (props: EthMergeWarningModalProps): JSX.Element => {
    return (
        <Modal
            show={props.show}
            backdrop="static"
            animation={false}
            keyboard={false}
            centered
            className="EthMergeWarningModal"
        >
            <Modal.Header closeButton>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-column justify-content-center align-items-center">
                <div className="content-area">
                    <div className="left-part">
                        <h3>Contract temporarily suspended</h3>
                        <p>Deposits and withdrawals are temporarily suspended due to an attack on the protocol. Please stay tuned for updates.</p>
                    </div>
                    <div className="right-part">
                        <img className="shark" src="/zunami-merge.svg" alt="Merge is coming" />
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};
