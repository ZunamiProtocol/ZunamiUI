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
                        <h3>The Merge Ethereum<br />is taking place right now</h3>
                        <p>The Zunami Protocol application has been suspended for the duration of the Merge. We will resume the protocol immediately after the Merge once we have ascertained the correct functioning of the system.</p>
                        <p>During the suspension of the protocol, the following operations will be unavailable:</p>
                        <div className="disabled-section">
                            <DepositIcon />
                            <span>Deposit & Withdraw</span>
                        </div>
                    </div>
                    <div className="right-part">
                        <img className="shark" src="/zunami-merge.svg" alt="Merge is coming" />
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};
