import { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import '../BscMigrationModal/BscMigrationModal.scss';
import { InfoBlock } from '../InfoBlock/InfoBlock';
import { BigNumber } from 'bignumber.js';
import { getBalanceNumber } from '../../utils/formatbalance';
import { getMasterChefContract } from '../../sushi/utils';
import { useWallet } from 'use-wallet';
import useSushi from '../../hooks/useSushi';
import { BIG_ZERO } from '../../utils/formatbalance';
import { isBSC } from '../../utils/zunami';
import { contractAddresses } from '../../sushi/lib/constants';
import migratorAbi from '../../sushi/lib/abi/bsc_1.2_migrator.json';
import Web3 from 'web3';

interface BscMigrationModalProps {
    balance: BigNumber;
    lpPrice: BigNumber;
    show: boolean;
    onWalletConnected?: Function;
    onHide?: Function;
}

const ALLOWANCE_SUM = '10000000000000000000000000';

export const BscMigrationModal2 = (props: BscMigrationModalProps): JSX.Element => {
    const [result, setResult] = useState('');
    const [pending, setPending] = useState(false);
    const { account, chainId, ethereum } = useWallet();
    const sushi = useSushi();
    const [pendingGZLP, setPendingGZLP] = useState(false);
    const [allowance, setAllowance] = useState(BIG_ZERO);
    const [isGZLPapproved, setGZLPapproved] = useState(false);
    const eth = window.ethereum;

    useEffect(() => {
        if (!account || chainId !== 56 || !props.show) {
            return;
        }

        const getAllowance = async () => {
            const oldBscContract = sushi.getBscContract(account);
            oldBscContract.options.address = contractAddresses.deprecated.v_1_1_bsc;

            const allowanceValue = await oldBscContract.methods
                .allowance(account, contractAddresses.zunami_bsc_migrator.v1_1_to_1_2)
                .call();

            console.log(`Allowance for BSC migrator: ${allowanceValue}`);

            const allowanceBig = new BigNumber(allowanceValue);
            setAllowance(allowanceBig);

            setGZLPapproved(
                allowanceBig.isGreaterThanOrEqualTo(new BigNumber('1000000000000000000000000'))
            );
        };

        getAllowance();
        let refreshInterval = setInterval(getAllowance, 5000);
        return () => clearInterval(refreshInterval);
    }, [chainId, account, sushi, props.show]);

    const handleApproveGzlp = useCallback(async () => {
        try {
            setPendingGZLP(true);
            const zunamiContract = getMasterChefContract(sushi, chainId);
            zunamiContract.options.address = contractAddresses.deprecated.v_1_1_bsc;

            const tx = zunamiContract.methods
                .approve(contractAddresses.zunami_bsc_migrator.v1_1_to_1_2, ALLOWANCE_SUM)
                .send({ from: account })
                .on('transactionHash', (tx) => {
                    return tx.transactionHash;
                });
            if (!tx) {
                setPendingGZLP(false);
            }
        } catch (e) {
            setPendingGZLP(false);
        }
    }, [account, chainId, sushi]);

    const migrate = useCallback(async () => {
        if (!account || !chainId) {
            return;
        }

        try {
            if (!isBSC(chainId)) {
                alert('Switch to BSC network to continue');
                return;
            }

            setPending(true);

            const web3 = new Web3(ethereum);
            const zunamiContract = new web3.eth.Contract(migratorAbi);
            zunamiContract.options.address = contractAddresses.zunami_bsc_migrator.v1_1_to_1_2;
            zunamiContract.options.from = account;
            zunamiContract.defaultAccount = account;

            await zunamiContract.methods
                .migrate()
                .send({ from: account })
                .on('transactionHash', (transactionHash) => {
                    return transactionHash;
                });

            setResult(
                `Funds successfully migrated. Page will be reloaded in 7 seconds...`
            );

            setTimeout(() => {
                window.location.reload();
            }, 7000);
        } catch (error: any) {
            debugger;
            setResult(`Error while withdraw: ${error.message}`);
        }

        setPending(false);
    }, [account, chainId, props.balance, sushi]);

    return (
        <Modal
            show={props.show}
            backdrop="static"
            animation={false}
            keyboard={false}
            centered
            onHide={() => {
                if (props.onHide) {
                    props.onHide();
                }
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-column justify-content-center align-items-center BscMigrationModal">
                <h3 className="text-center">
                    Zunami BSC Gateway v1.1 is outdated, you need to migrate to Zunami BSC Gateway
                    v1.2
                </h3>
                <p className="text-center">
                We apologize, but in order to continue using the protocol, you will need to migrate your funds
                from the outdated version and to the new one. Don’t worry!
                Your funds and income are saved. Funds will be migrated immediately.
                </p>
                <InfoBlock
                    title="Balance"
                    description={`$ ${getBalanceNumber(props.balance.multipliedBy(props.lpPrice))
                        .toNumber()
                        .toLocaleString('en')}`}
                    withColor={true}
                    isStrategy={false}
                    colorfulBg={true}
                />
                {!isGZLPapproved && isBSC(chainId) && (
                    <button
                        className={`zun-button ${pendingGZLP ? 'disabled' : ''}`}
                        onClick={handleApproveGzlp}
                    >
                        Approve GZLP
                    </button>
                )}
                <button
                    className={`zun-button ${pending ? 'disabled' : ''} ${
                        !isGZLPapproved || !isBSC(chainId) ? 'hide' : ''
                    }`}
                    onClick={migrate}
                >
                    Migrate
                </button>
                {!isBSC(chainId) && (
                    <div className="alert alert-warning text-center">
                        Please, switch to Binance Smart Chain network.
                        <button
                            className="zun-button mt-2"
                            onClick={async () => {
                                await eth.request({
                                    method: 'wallet_switchEthereumChain',
                                    params: [{ chainId: '0x38' }],
                                });
                                window.location.reload();
                            }}
                        >
                            Switch to BSC
                        </button>
                    </div>
                )}
                {result && <div className="alert alert-info">{result}</div>}
            </Modal.Body>
        </Modal>
    );
};
