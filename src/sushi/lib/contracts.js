import BigNumber from 'bignumber.js/bignumber';

import ethAbi from '../../actions/abi/Zunami.json';
import bscAbi from '../../actions/abi/zunami_bsc.json';
import busdAbi from '../../actions/abi/zunami_busd.json';
import polygonAbi from '../../actions/abi/zunami_polygon.json';
import uzdAbi from '../../actions/abi/zunami_uzd.json';

import WETHAbi from './abi/weth.json';
import { contractAddresses, SUBTRACT_GAS_LIMIT } from './constants.js';
import * as Types from './types.js';

export class Contracts {
    constructor(provider, networkId, web3, options) {
        this.web3 = web3;
        this.defaultConfirmations = options.defaultConfirmations;
        this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
        this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
        this.defaultGas = options.defaultGas;
        this.defaultGasPrice = options.defaultGasPrice;

        this.masterChef = new this.web3.eth.Contract(ethAbi);

        this.ethMasterChef = new this.web3.eth.Contract(ethAbi);
        this.bscMasterChef = new this.web3.eth.Contract(bscAbi);
        this.busdContract = new this.web3.eth.Contract(busdAbi);
        this.polygonContract = new this.web3.eth.Contract(polygonAbi);
        this.uzdContract = new this.web3.eth.Contract(uzdAbi);

        this.weth = new this.web3.eth.Contract(WETHAbi);
        this.usdc = new this.web3.eth.Contract(WETHAbi);
        this.setProvider(provider, networkId);

        const defaultAccount =
            this.web3.eth.defaultAccount || window.localStorage.getItem('WALLET_ACCOUNT');

        this.setDefaultAccount(defaultAccount);
        this.masterChef.options.from = defaultAccount;
        this.bscMasterChef.options.from = defaultAccount;
        this.polygonContract.options.from = defaultAccount;
        this.ethMasterChef.options.from = defaultAccount;
        this.busdContract.options.from = defaultAccount;
        this.uzdContract.options.from = defaultAccount;
    }

    setDefaultAccount(account) {
        this.masterChef.options.from = account;
    }

    setProvider(provider, networkId) {
        const setProviderParams = (contract, address) => {
            contract.setProvider(provider);
            contract.options.address = address;
        };

        if (networkId === 1) {
            setProviderParams(this.masterChef, contractAddresses.zunami[1]);
        }

        setProviderParams(this.ethMasterChef, contractAddresses.zunami[1]);
        setProviderParams(this.uzdContract, contractAddresses.uzd[1]);

        if (networkId === 56) {
            setProviderParams(this.bscMasterChef, contractAddresses.zunami[56]);
            setProviderParams(this.busdContract, contractAddresses.busd[56]);
        }

        if (networkId === 137) {
            setProviderParams(this.polygonContract, contractAddresses.zunami[137]);
        }
    }

    async callContractFunction(method, options) {
        const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

        if (!this.blockGasLimit) {
            await this.setGasLimit();
        }

        if (!txOptions.gasPrice && this.defaultGasPrice) {
            txOptions.gasPrice = this.defaultGasPrice;
        }

        if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
            let gasEstimate;
            if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
                txOptions.gas = this.defaultGas;
            } else {
                try {
                    // console.log('estimating gas')
                    gasEstimate = await method.estimateGas(txOptions);
                } catch (error) {
                    const data = method.encodeABI();
                    const { from, value } = options;
                    const to = method._parent._address;
                    error.transactionData = { from, value, data, to };
                    throw error;
                }

                const multiplier = autoGasMultiplier || this.autoGasMultiplier;
                const totalGas = Math.floor(gasEstimate * multiplier);
                txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
            }

            if (confirmationType === Types.ConfirmationType.Simulate) {
                let g = txOptions.gas;
                return { gasEstimate, g };
            }
        }

        if (txOptions.value) {
            txOptions.value = new BigNumber(txOptions.value).toFixed(0);
        } else {
            txOptions.value = '0';
        }

        const promi = method.send(txOptions);

        const OUTCOMES = {
            INITIAL: 0,
            RESOLVED: 1,
            REJECTED: 2,
        };

        let hashOutcome = OUTCOMES.INITIAL;
        let confirmationOutcome = OUTCOMES.INITIAL;

        const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

        if (!Object.values(Types.ConfirmationType).includes(t)) {
            throw new Error(`Invalid confirmation type: ${t}`);
        }

        let hashPromise;
        let confirmationPromise;

        if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
            hashPromise = new Promise((resolve, reject) => {
                promi.on('error', (error) => {
                    if (hashOutcome === OUTCOMES.INITIAL) {
                        hashOutcome = OUTCOMES.REJECTED;
                        reject(error);
                        const anyPromi = promi;
                        anyPromi.off();
                    }
                });

                promi.on('transactionHash', (txHash) => {
                    if (hashOutcome === OUTCOMES.INITIAL) {
                        hashOutcome = OUTCOMES.RESOLVED;
                        resolve(txHash);
                        if (t !== Types.ConfirmationType.Both) {
                            const anyPromi = promi;
                            anyPromi.off();
                        }
                    }
                });
            });
        }

        if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
            confirmationPromise = new Promise((resolve, reject) => {
                promi.on('error', (error) => {
                    if (
                        (t === Types.ConfirmationType.Confirmed ||
                            hashOutcome === OUTCOMES.RESOLVED) &&
                        confirmationOutcome === OUTCOMES.INITIAL
                    ) {
                        confirmationOutcome = OUTCOMES.REJECTED;
                        reject(error);
                        const anyPromi = promi;
                        anyPromi.off();
                    }
                });

                const desiredConf = confirmations || this.defaultConfirmations;
                if (desiredConf) {
                    promi.on('confirmation', (confNumber, receipt) => {
                        if (confNumber >= desiredConf) {
                            if (confirmationOutcome === OUTCOMES.INITIAL) {
                                confirmationOutcome = OUTCOMES.RESOLVED;
                                resolve(receipt);
                                const anyPromi = promi;
                                anyPromi.off();
                            }
                        }
                    });
                } else {
                    promi.on('receipt', (receipt) => {
                        confirmationOutcome = OUTCOMES.RESOLVED;
                        resolve(receipt);
                        const anyPromi = promi;
                        anyPromi.off();
                    });
                }
            });
        }

        if (t === Types.ConfirmationType.Hash) {
            const transactionHash = await hashPromise;
            if (this.notifier) {
                this.notifier.hash(transactionHash);
            }
            return { transactionHash };
        }

        if (t === Types.ConfirmationType.Confirmed) {
            return confirmationPromise;
        }

        const transactionHash = await hashPromise;
        if (this.notifier) {
            this.notifier.hash(transactionHash);
        }
        return {
            transactionHash,
            confirmation: confirmationPromise,
        };
    }

    async callConstantContractFunction(method, options) {
        const m2 = method;
        const { blockNumber, ...txOptions } = options;
        return m2.call(txOptions, blockNumber);
    }

    async setGasLimit() {
        const block = await this.web3.eth.getBlock('latest');
        this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
    }
}
