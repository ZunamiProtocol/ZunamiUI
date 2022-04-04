import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from 'use-wallet';
import BigNumber from 'bignumber.js';
import { contractAddresses } from '../sushi/lib/constants';
import { BIG_TEN, DAI_DECIMALS } from '../utils/formatbalance';

export interface PendingOperations {
    deposit: BigNumber;
    withdraw: BigNumber;
}

const usePendingOperations = (): PendingOperations => {
    const [pendingDeposit, setPendingDeposit] = useState(new BigNumber(0));
    const [pendingWithdraw, setPendingWithdraw] = useState(new BigNumber(0));
    const zunamiAddr = contractAddresses.zunami[1];
    const { account } = useWallet();

    const depositEventHandler = (addr: number, amounts: BigNumber[]) => {
        setPendingDeposit(
            amounts.reduce((prev: BigNumber, curr: BigNumber): BigNumber => prev.plus(curr))
        );
    };

    const withdrawEventHandler = (addr: number, amounts: BigNumber[], lpShares: number) => {
        setPendingWithdraw(
            amounts.reduce((prev: BigNumber, curr: BigNumber): BigNumber => prev.plus(curr))
        );
    };

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
            const pendingCoins = await contract.pendingDeposits(account);

            const result = [
                new BigNumber(pendingCoins[0].toString()),
                new BigNumber(pendingCoins[1].toString()),
                new BigNumber(pendingCoins[2].toString()),
            ];

            if (result[0].toFixed()) {
                result[0] = result[0].dividedBy(BIG_TEN.pow(DAI_DECIMALS));
            }

            setPendingDeposit(result[0].plus(result[1]).plus(result[2]));

            const val = await contract.pendingWithdrawals(account);
            setPendingWithdraw(new BigNumber(val.toString()));
        };

        if (contract && account) {
            initPendings();
        }

        const filterDeposit = contract.filters.CreatedPendingDeposit(account);
        const filterWithdraw = contract.filters.CreatedPendingWithdrawal(account);

        contract.on(filterDeposit, depositEventHandler);
        contract.on(filterWithdraw, withdrawEventHandler);

        return () => {
            contract.off(filterDeposit, depositEventHandler);
            contract.off(filterWithdraw, withdrawEventHandler);
        };
    }, [account, zunamiAddr]);

    const operations: PendingOperations = {
        deposit: pendingDeposit,
        withdraw: pendingWithdraw,
    };

    return operations;
};

export default usePendingOperations;
