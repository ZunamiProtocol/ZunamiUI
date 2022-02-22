import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from 'use-wallet';

export interface PendingOperations {
    deposit: number;
    withdraw: number;
}

const usePendingOperations = (): PendingOperations => {
    const [pendingDeposit, setPendingDeposit] = useState(0);
    const [pendingWithdraw, setPendingWithdraw] = useState(0);
    const zunamiAddr = '0xf790d57443C2E9aDEc8C42bA92Bff5B7Ec84A895';
    const abi = [
        'event CreatedPendingDeposit(address indexed depositor, uint256[3] amounts)',
        'event CreatedPendingWithdrawal(address indexed withdrawer, uint256[3] amounts, uint256 lpShares)',
        'function pendingDeposits(address) public view returns(uint256[3] deposit)',
        'function pendingWithdrawals(address) public view returns(tuple(uint256 lpShares, uint256[3] withdraw))',
    ];
    const { account } = useWallet();
    const httpProvider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(zunamiAddr, abi, httpProvider.getSigner());

    const depositEventHandler = (addr: number, amounts: number[]) => {
        setPendingDeposit(amounts.reduce((prev: number, curr: number): number => prev + curr));
    };

    const withdrawEventHandler = (addr: number, amounts: number[], lpShares: number) => {
        setPendingWithdraw(amounts.reduce((prev: number, curr: number): number => prev + curr));
    };

    useEffect(() => {
        const initPendings = async () => {
            const deposit = await contract.pendingDeposits(account);
            setPendingDeposit(deposit.reduce((prev: number, curr: number): number => prev + curr));

            const withdraw = await contract.pendingWithdrawals(account)[1];
            setPendingWithdraw(
                withdraw.reduce((prev: number, curr: number): number => prev + curr)
            );
        };

        initPendings();

        const filterDeposit = contract.filters.CreatedPendingDeposit(account);
        const filterWithdraw = contract.filters.CreatedPendingWithdrawal(account);

        contract.on(filterDeposit, depositEventHandler);
        contract.on(filterWithdraw, withdrawEventHandler);

        return () => {
            contract.off(filterDeposit, depositEventHandler);
            contract.off(filterWithdraw, withdrawEventHandler);
        };
    }, []);

    const operations: PendingOperations = {
        deposit: pendingDeposit,
        withdraw: pendingWithdraw,
    };

    return operations;
};

export default usePendingOperations;
