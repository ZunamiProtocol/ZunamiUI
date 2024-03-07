import { Contract } from 'web3-eth-contract';
import { log } from '../utils/logger';

/**
 * Calculates how many coins user will get in exchange to lp tokens
 * @param zunamiContract contract
 * @param lpBalance string Balance in LP tokens
 * @param coinIndex number Coin index (0 - DAI, 1 - USDC, 2 - USDT)
 * @returns string
 */
export const calcWithdrawOneCoin = async (
    lpBalance: string,
    coinIndex: number,
    account: string | null,
    contract: any
): Promise<string> => {
    contract.options.from = account;

    log(
        `ETH contract (${contract.options.address}) - calcWithdrawOneCoin(${lpBalance}, ${coinIndex}).`
    );
    let sum: string = 'Error';

    try {
        sum = await contract.methods.calcWithdrawOneCoin(lpBalance, coinIndex).call();
        log(`ETH contract (${contract.options.address}) - calcWithdrawOneCoin result ${sum}`);
    } catch {
        const whaleWalletAccount = '0x9a9f10c8d28faf74358434ec7916acc25dbb41ca';
        contract.options.from = whaleWalletAccount;
        sum = await contract.methods.calcWithdrawOneCoin(lpBalance, coinIndex).call();
        log(
            `ETH contract (${contract.options.address}) - calcWithdrawOneCoin result ${sum}. From address - ${whaleWalletAccount}`
        );
    }

    return sum;
};

/**
 * Calculates how many coins user will get in exchange to lp tokens
 * @param zunamiContract contract
 * @param lpBalance string Balance in LP tokens
 * @returns string
 */
export const calcWithdrawOneCoinFrax = async (
    lpBalance: string,
    account: string | null,
    contract: any
): Promise<string> => {
    contract.options.from = account;

    log(`FRAX contract (${contract.options.address}) - calcWithdraw(${lpBalance}).`);
    let sum: string = 'Error';
    try {
        sum = await contract.methods.calcWithdraw(lpBalance).call();
    } catch {
        const whaleWalletAccount = '0xc288540f761179dfcf5e64514282463515839df4';
        contract.options.from = whaleWalletAccount;
        sum = await contract.methods.calcWithdraw(lpBalance).call();
    }
    log(`FRAX contract (${contract.options.address}) - calcWithdraw result ${sum}`);
    return sum;
};

export const getLpPrice = async (masterChefContract: Contract): Promise<string> => {
    return await masterChefContract.methods.lpPrice().call();
};

export const getUserLpAmount = async (
    masterChefContract: Contract,
    userAddress: string
): Promise<string> => {
    try {
        const lpAmount: string = await masterChefContract.methods.balanceOf(userAddress).call();
        return lpAmount;
    } catch (e) {
        return '0';
    }
};
