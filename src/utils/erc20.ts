import Web3 from 'web3';
import { provider as Provider } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import ERC20 from '../actions/abi/erc20.abi.json';
import { contractAddresses } from '../sushi/lib/constants';
import { log } from '../utils/logger';
import { daiAddress, fraxAddress, usdcAddress, usdtAddress } from './formatbalance';
import { erc20ABI, Address } from 'wagmi';
import { getContract as getContractWagmi, readContract } from '@wagmi/core';

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

        log(
            `Executing allowance() for contract ${contractAddresses.uzd[1]}. Parameters: ${account}, ${zunamiContractAddress}`
        );
        return allowance;
    } catch (e) {
        return '0';
    }
};

export const getAllowance = async (
    tokenAddress: Address,
    masterChefContract: Contract,
    account: Address
): Promise<bigint> => {
    try {
        const allowance: bigint = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [account, masterChefContract.options.address],
        });

        let debugName: Address | string = tokenAddress;

        switch (tokenAddress.toLowerCase()) {
            case daiAddress.toLowerCase():
                debugName = '(DAI)';
                break;
            case usdcAddress:
                debugName = '(USDC)';
                break;
            case usdtAddress:
                debugName = '(USDT)';
                break;
            case fraxAddress.toLowerCase():
                debugName = '(FRAX)';
                break;
            case contractAddresses.uzd[1].toLowerCase():
                debugName = '(UZD)';
                break;
        }

        log(
            `Executing of contract ${debugName} - allowance(${account}, ${masterChefContract.options.address}). Result: ${allowance}`
        );
        return allowance;
    } catch (e: any) {
        log(
            `Error while getting allowance(${account}, ${masterChefContract.options.address}}): ${e.message}`
        );
        return 0n;
    }
};

export const getBalance = async (tokenAddress: Address, userAddress: Address): Promise<bigint> => {
    try {
        const balance: bigint = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [userAddress],
        });

        log(`Balance for address ${tokenAddress} is ${balance}`);
        return balance;
    } catch (e: any) {
        log(`Balance for address ${tokenAddress} is 0. Error: ${e.message}`);
        return 0n;
    }
};
