import { BigNumber } from 'bignumber.js';

export interface FormProps {
    operationName: string;
    directOperation: boolean;
    onOperationModeChange?: Function;
    sharePercent: number;
    onCoinChange?: Function;
    dai: string;
    usdc: string;
    usdt: string;
    busd: string;
    selectedCoinIndex: number;
    directOperationDisabled?: boolean;
    lpPrice: BigNumber;
    onWithdraw?: Function;
    onDeposit?: Function;
    slippage: string;
}

export interface TransactionError {
    code?: Number;
    message?: String;
}
