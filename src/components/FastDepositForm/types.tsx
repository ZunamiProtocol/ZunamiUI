import { bsc, polygon } from '@wagmi/chains';
import { ToastContainer, Toast } from 'react-bootstrap';
import { sepolia } from 'wagmi';

export function getScanAddressByChainId(chainId: number) {
    let address = 'etherscan.io';

    switch (chainId) {
        case bsc.id:
            address = 'bscscan.com';
            break;
        case polygon.id:
            address = 'polygonscan.com';
            break;
        case sepolia.id:
            address = 'sepolia.etherscan.io';
            break;
    }

    return address;
}

export function renderToasts(
    transactionError: boolean,
    setTransactionError: Function,
    chainId: number,
    transactionId: string | undefined,
    setTransactionId: Function
) {
    return (
        <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
            {transactionError && (
                <Toast onClose={() => setTransactionError(false)} delay={10000} autohide>
                    <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                </Toast>
            )}
            {transactionId && (
                <Toast onClose={() => setTransactionId(undefined)} delay={15000} autohide>
                    <Toast.Body>
                        Success! Check out the{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={`https://${getScanAddressByChainId(chainId)}/tx/${transactionId}`}
                        >
                            transaction
                        </a>
                    </Toast.Body>
                </Toast>
            )}
        </ToastContainer>
    );
}

export interface FastDepositFormProps {
    stakingMode: string;
}
