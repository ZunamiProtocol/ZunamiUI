import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from 'use-wallet';
import BigNumber from 'bignumber.js';
import { getBalanceNumber } from '../utils/formatbalance';
import { contractAddresses } from '../sushi/lib/constants';

export interface PendingOperations {
    deposit: BigNumber;
    withdraw: BigNumber;
}

const usePendingOperations = (): PendingOperations => {
    const [pendingDeposit, setPendingDeposit] = useState(new BigNumber(0));
    const [pendingWithdraw, setPendingWithdraw] = useState(new BigNumber(0));
    const zunamiAddr = contractAddresses.zunami[1];
    const { account } = useWallet();

    // const depositEventHandler = (addr: number, amounts: number[]) => {
    //     setPendingDeposit(amounts.reduce((prev: number, curr: number): number => prev + curr));
    // };

    // const withdrawEventHandler = (addr: number, amounts: number[], lpShares: number) => {
    //     setPendingWithdraw(amounts.reduce((prev: number, curr: number): number => prev + curr));
    // };

    useEffect(() => {
        if (!window.ethereum) {
            const test = async () => {
                setPendingDeposit(new BigNumber(0));
                setPendingWithdraw(new BigNumber(0));
            };

            test();
            return;
        }

        const abi = [
            'event CreatedPendingDeposit(address indexed depositor, uint256[3] amounts)',
            'event CreatedPendingWithdrawal(address indexed withdrawer, uint256[3] amounts, uint256 lpShares)',
            'function pendingDeposits(address) public view returns(uint256[3])',
            'function pendingWithdrawals(address) public view returns(uint256)',
        ];
        const httpProvider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(zunamiAddr, abi, httpProvider.getSigner());

        const initPendings = async () => {
            try {
                const pendingCoins = await contract.pendingDeposits(account);

                const result = [
                    new BigNumber(pendingCoins[0].toString()),
                    new BigNumber(pendingCoins[1].toString()),
                    new BigNumber(pendingCoins[2].toString()),
                ];

                setPendingDeposit(result[0].plus(result[1]).plus(result[2]));
            } catch (error) {
                debugger;
            }

            try {
                const val = await contract.pendingWithdrawals(account);
                setPendingWithdraw(new BigNumber(val.toString()));
            } catch (error) {
                debugger;
            }
        };

        if (contract && account) {
            initPendings();
        }

        // const filterDeposit = contract.filters.CreatedPendingDeposit(account);
        // const filterWithdraw = contract.filters.CreatedPendingWithdrawal(account);

        // contract.on(filterDeposit, depositEventHandler);
        // contract.on(filterWithdraw, withdrawEventHandler);

        return () => {
            // contract.off(filterDeposit, depositEventHandler);
            // contract.off(filterWithdraw, withdrawEventHandler);
        };
    }, [account, zunamiAddr]);

    const operations: PendingOperations = {
        deposit: pendingDeposit,
        withdraw: pendingWithdraw,
    };

    return operations;
};

export default usePendingOperations;
