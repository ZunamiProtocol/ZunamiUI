import {Contract} from 'web3-eth-contract';

export const getTotalHoldings = async (
    masterChefContract: Contract,
): Promise<string> => {
    try {
        const totalHoldings: string = await masterChefContract.methods.totalHoldings().call();
        return totalHoldings;
    } catch (e) {
        return '0';
    }
};

