import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import useSushi from './useSushi';
import { BIG_TEN, DAI_DECIMALS } from '../utils/formatbalance';
import { log } from '../utils/logger';
import { isBSC, isETH, isPLG } from '../utils/zunami';

export interface PendingOperations {
    deposit: BigNumber;
    withdraw: BigNumber;
}

const usePendingOperations = () => {
    const { chainId, account } = useWallet();
    const sushi = useSushi();
    const [pendingDeposit, setPendingDeposit] = useState(new BigNumber(0));
    const [pendingWithdraw, setPendingWithdraw] = useState(new BigNumber(0));

    useEffect(() => {
        if (!account || !chainId || !sushi) {
            return;
        }

        const getPendingSums = async () => {
            if (isETH(chainId)) {
                const ethPendingDeposits = await sushi.contracts.masterChef.methods
                    .pendingDeposits(account)
                    .call();

                const result = [
                    new BigNumber(ethPendingDeposits[0].toString()),
                    new BigNumber(ethPendingDeposits[1].toString()),
                    new BigNumber(ethPendingDeposits[2].toString()),
                ];

                if (result[0].toFixed()) {
                    result[0] = result[0].dividedBy(BIG_TEN.pow(DAI_DECIMALS));
                }

                const totalPendingDepositSum = result[0].plus(result[1]).plus(result[2]);
                log(`ETH pending deposits: ${totalPendingDepositSum.toString()}`);

                setPendingDeposit(totalPendingDepositSum);

                const ethPendingWithdrawals = await sushi.contracts.masterChef.methods
                    .pendingWithdrawals(account)
                    .call();

                setPendingWithdraw(new BigNumber(ethPendingWithdrawals[0].toString()));
                log(`ETH pending withdrawals: ${ethPendingWithdrawals[0].toString()}`);
            } else if (isBSC(chainId)) {
                const bscPendingDeposits = await sushi.bscContracts.bscMasterChef.methods
                    .pendingDeposits(account)
                    .call();
                const bscPendingWithdrawals = await sushi.bscContracts.bscMasterChef.methods
                    .pendingWithdrawals(account)
                    .call();

                setPendingDeposit(new BigNumber(bscPendingDeposits.toString()));
                setPendingWithdraw(new BigNumber(bscPendingWithdrawals.toString()));

                log(`BSC pending deposits: ${bscPendingDeposits.toString()}`);
                log(`BSC pending withdrawals: ${bscPendingWithdrawals.toString()}`);
            } else if (isPLG(chainId)) {
                const plgPendingDeposits = await sushi.plgContracts.polygonContract.methods
                    .pendingDeposits(account)
                    .call();
                const plgPendingWithdrawals = await sushi.plgContracts.polygonContract.methods
                    .pendingWithdrawals(account)
                    .call();

                setPendingDeposit(new BigNumber(plgPendingDeposits.toString()));
                setPendingWithdraw(new BigNumber(plgPendingWithdrawals.toString()));

                log(`PLG pending deposits: ${plgPendingDeposits.toString()}`);
                log(`PLG pending withdrawals: ${plgPendingWithdrawals.toString()}`);
            }
        };

        getPendingSums();
    }, [account, chainId, sushi]);

    const operations: PendingOperations = {
        deposit: pendingDeposit,
        withdraw: pendingWithdraw,
    };

    return operations;
};

export default usePendingOperations;
