import { ToastContainer, Toast } from 'react-bootstrap';
import './ErrorToast.scss';

interface ErrorToastProsp {
    visible: boolean;
}

export const ErrorToast = (props: ErrorToastProsp): JSX.Element => {
    return (
        <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
            {props.visible && (
                <Toast delay={5000} autohide className="ErrorToast">
                    <Toast.Body>You have lost your internet connection</Toast.Body>
                </Toast>
            )}
        </ToastContainer>
    );
};
