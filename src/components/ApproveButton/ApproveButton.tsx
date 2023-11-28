import React, { useState } from 'react';
import './ApproveButton.scss';
import { getTheme, setTheme as saveTheme } from '../../functions/theme';
import {
    Address,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { APPROVE_SUM } from '../../sushi/utils';

interface ApproveButtonProps {
    disabled?: boolean;
    contractAddress: Address;
    onClick?: Function;
    abi: any;
    account: Address;
    onApprove: Function;
    onReject: Function;
}

export const ApproveButton = (props: ApproveButtonProps): JSX.Element => {
    const [isLoading, setIsLoading] = useState(false);

    // 1. Read from ERC20 contract. Does spender (0x Exchange Proxy) have an allowance?
    const { data: allowance, refetch } = useContractRead({
        address: props.contractAddress,
        abi: props.abi,
        functionName: 'allowance',
        args: [props.account, props.contractAddress],
    });

    console.log(`Allowance: ${allowance}`);

    // 2. (Only if no allowance): Write to ERC20, approve 0x Exchange Proxy to spend max integer
    const { config } = usePrepareContractWrite({
        address: props.contractAddress,
        abi: props.abi,
        functionName: 'approve',
        args: [props.account, APPROVE_SUM],
    });

    const { data: writeContractResult, writeAsync: approveAsync, error } = useContractWrite(config);

    const { isLoading: isApproving } = useWaitForTransaction({
        hash: writeContractResult ? writeContractResult.hash : undefined,
        onSuccess(data) {
            refetch();

            if (props.onApprove) {
                props.onApprove(data);
            }
        },
    });

    return (
        <button
            className={`zun-button approve-usd ${props.disabled ? 'disabled' : ''}`}
            onClick={async () => {}}
        >
            Approve
        </button>
    );
};
