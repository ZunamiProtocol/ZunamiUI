import Web3 from 'web3';
import { provider as Provider } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import ERC20 from '../actions/abi/erc20.abi.json';
import { contractAddresses } from '../sushi/lib/constants';
import { log } from '../utils/logger';
import { daiAddress, fraxAddress, usdcAddress, usdtAddress } from './formatbalance';
import { isPLG } from './zunami';

export const getContract = (provider: Provider, address: string) => {
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(ERC20 as unknown as AbiItem, address);
    return contract;
};

export const getUzdAllowance = async (
    provider: Provider,
    zunamiContractAddress: string,
    account: string
): Promise<string> => {
    const lpContract = getContract(provider, contractAddresses.zunami[1]);

    try {
        const allowance: string = await lpContract.methods
            .allowance(account, contractAddresses.uzd[1])
            .call();

        log(`Executing allowance() for contract ${contractAddresses.uzd[1]}. Parameters: ${account}, ${zunamiContractAddress}`);
        return allowance;
    } catch (e) {
        return '0';
    }
};

export const getAllowance = async (
    provider: Provider,
    tokenAddress: string,
    masterChefContract: Contract,
    account: string
): Promise<string> => {
    const lpContract = getContract(provider, tokenAddress);
    try {
        // debugger;
        const allowance: string = await lpContract.methods
            .allowance(account, masterChefContract.options.address)
            .call();

        let debugName = lpContract.options.address;

        switch (debugName.toLowerCase()) {
            case daiAddress.toLowerCase(): debugName = '(DAI)'; break;
            case usdcAddress: debugName = '(USDC)'; break;
            case usdtAddress: debugName = '(USDT)'; break;
            case fraxAddress.toLowerCase(): debugName = '(FRAX)'; break;
        }

        log(`Executing of contract ${debugName} - allowance(${account}, ${masterChefContract.options.address}). Result: ${allowance}`);
        return allowance;
    } catch (e) {
        debugger;
        return '0';
    }
};

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
    account: string | null
): Promise<string> => {
    const contract = sushi.getEthContract();
    contract.options.from = account;
    log(`ETH contract (${contract.options.address}) - calcWithdrawOneCoin(${lpBalance}, ${coinIndex}).`);
    let sum: string = "Error";

    try {
        sum = await contract.methods.calcWithdrawOneCoin(lpBalance, coinIndex).call();
        log(`ETH contract (${contract.options.address}) - calcWithdrawOneCoin result ${sum}`);
    } catch {
        const chainId = parseInt(window?.ethereum.chainId, 16);
        let whaleWalletAccount = '';

        switch (chainId) {
            case 1:
                whaleWalletAccount = '0xc288540f761179dfcf5e64514282463515839df4';
                break;
            case 137:
                whaleWalletAccount = '0x451862c9031e57df0be61751a4888456adcd1787';
                break;
            case 56:
                whaleWalletAccount = '0xc288540f761179dfcf5e64514282463515839df4';
                break;
        }

        contract.options.from = whaleWalletAccount;
        sum = await contract.methods.calcWithdrawOneCoin(lpBalance, coinIndex).call();
        log(`ETH contract (${contract.options.address}) - calcWithdrawOneCoin result ${sum}. From address - ${whaleWalletAccount}`);
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
    account: string | null
): Promise<string> => {
    const contract = sushi.getFraxContract();
    contract.options.from = account;
    log(`FRAX contract (${contract.options.address}) - calcWithdraw(${lpBalance}).`);
    let sum: string = "Error";
    try {
        sum = await contract.methods.calcWithdraw(lpBalance).call();
    } catch {
        const whaleWalletAccount = "0xc288540f761179dfcf5e64514282463515839df4";
        contract.options.from = whaleWalletAccount;
        sum = await contract.methods.calcWithdraw(lpBalance).call();
    }
    log(`FRAX contract (${contract.options.address}) - calcWithdraw result ${sum}`);
    return sum;
};

export const getBalance = async (
    provider: Provider,
    tokenAddress: string,
    userAddress: string
): Promise<string> => {
    const lpContract = getContract(provider, tokenAddress);
    try {
        const balance: string = await lpContract.methods.balanceOf(userAddress).call();
        return balance;
    } catch (e) {
        return '0';
    }
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
