import Accordion from 'react-bootstrap/Accordion';
import { MicroCard } from '../../components/MicroCard/MicroCard';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './StakingPool.scss';
import { StakingPoolInfo } from '../../hooks/useStakingPools';
import useAllowance from '../../hooks/useAllowance';
import { useAccount, useNetwork } from 'wagmi';
import { getZunStakingAddress, getZunUsdApsAddress } from '../../utils/zunami';
import { useMemo, useState } from 'react';
import { APPROVE_SUM } from '../../sushi/utils';
import useApprove from '../../hooks/useApprove';
import { log } from '../../utils/logger';
import useStake from '../../hooks/useStake';
import { NULL_ADDRESS, getFullDisplayBalance } from '../../utils/formatbalance';
import { Toast, ToastContainer } from 'react-bootstrap';
import { getScanAddressByChainId } from '../FastDepositForm/types';

interface StakingPoolProps extends StakingPoolInfo {
    index: string;
}

export function renderToasts(
    transactionError: boolean,
    setTransactionError: Function,
    chainId: number,
    transactionId: string | undefined,
    setTransactionId: Function
) {
    return (
        <ToastContainer position={'top-end'} className={'toasts mt-3 me-3'}>
            {transactionError && (
                <Toast onClose={() => setTransactionError(false)} delay={10000} autohide>
                    <Toast.Body>Sorry, we couldn't complete the transaction</Toast.Body>
                </Toast>
            )}
            {transactionId && (
                <Toast onClose={() => setTransactionId(undefined)} delay={15000} autohide>
                    <Toast.Body>
                        Success! Check out the{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={`https://${getScanAddressByChainId(chainId)}/tx/${transactionId}`}
                        >
                            transaction
                        </a>
                    </Toast.Body>
                </Toast>
            )}
        </ToastContainer>
    );
}

export const StakingPool: React.FC<StakingPoolProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    index,
    title,
    platform,
    tvl,
    apr,
    claimed,
    unclaimed,
    balance,
    address,
    maxStakingSum,
}) => {
    const { address: account } = useAccount();
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const [pendingTx, setPendingTx] = useState(false);
    const [transactionError, setTransactionError] = useState(false);
    const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
    const [depositSum, setDepositSum] = useState('0');
    const { stakingDeposit } = useStake(-1, depositSum, account || NULL_ADDRESS, 'UZD');

    const stakingAllowance = useAllowance(
        getZunUsdApsAddress(chainId),
        account,
        getZunStakingAddress(chainId),
        chainId
    );

    log(`Staking pool ${address} allowance: ${stakingAllowance.toString()}`);

    const stakingApproved = useMemo(() => {
        return stakingAllowance.toNumber() > 0;
    }, [stakingAllowance]);

    const stakingEnabled = useMemo(() => {
        return (
            stakingApproved &&
            Number(depositSum) > 0 &&
            depositSum <= getFullDisplayBalance(maxStakingSum, 18, 18)
        );
    }, [depositSum, stakingApproved, maxStakingSum]);

    // approve
    const {
        data: approveResult,
        isLoading: isApproving,
        isSuccess: approveSuccessful,
        write: approve,
    } = useApprove(
        getZunUsdApsAddress(chainId),
        getZunStakingAddress(chainId),
        APPROVE_SUM,
        chainId
    );

    return (
        <Accordion.Item eventKey={index}>
            {renderToasts(
                transactionError,
                setTransactionError,
                chainId ?? 1,
                transactionId,
                setTransactionId
            )}
            <Accordion.Header>
                <div className="d-flex pool-row">
                    <div className="d-flex align-items-center pool">
                        <div className="header">Pool name</div>
                        <img src="/stake-dao.svg" alt="" className="primary-icon" />
                        <div className="divider ms-2 me-2"></div>
                        <div className="coins">
                            <img src="/uzd.svg" alt="" />
                            <img src="/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e.png" alt="" />
                        </div>
                        <div className="titles">
                            <div className="primary">{title}</div>
                            <div className="secondary">{platform}</div>
                        </div>
                    </div>
                    <div className="tvl vela-sans">
                        <div className="header">TVL</div>
                        <div>{getFullDisplayBalance(tvl)}</div>
                    </div>
                    <div className="apr vela-sans">
                        <div className="header">APR</div>
                        <div>{apr}%</div>
                    </div>
                    <div className="deposit-val vela-sans">
                        <div className="header">Your deposit</div>
                        <div>{getFullDisplayBalance(balance)}</div>
                    </div>
                    <div className="claimed vela-sans">
                        <div className="header">Claimed</div>
                        <div className="d-flex align-items-center gap-2">
                            <img src="/zun.svg" alt="" />
                            <div>{claimed} ZUN</div>
                        </div>
                    </div>
                    <div className="unclaimed vela-sans">
                        <div className="header">Unclaimed</div>
                        <div className="d-flex align-items-center gap-2">
                            <img src="/zun.svg" alt="" />
                            <div>{unclaimed} ZUN</div>
                        </div>
                    </div>
                </div>
                <div className="d-flex d-lg-none gap-2 w-100 first-row-counters mt-3">
                    <MicroCard title="TVL" value={getFullDisplayBalance(tvl)} />
                    <MicroCard title="APR" value={`${apr}%`} hint="Some tooltip content" />
                    <MicroCard title="Deposit" value={getFullDisplayBalance(balance)} />
                </div>
                <div className="d-flex d-lg-none gap-2 w-100 second-row-counters mt-3">
                    <MicroCard title="Already claimed" value={claimed.toString()} />
                    <MicroCard title="Unclaimed" value={unclaimed.toString()} />
                </div>
            </Accordion.Header>
            <Accordion.Body>
                <div className="row">
                    <div className="col-xs-12 col-md-12">
                        <Tabs
                            defaultActiveKey="stake"
                            transition={false}
                            id="noanim-tab-example"
                            className="action-tabs"
                        >
                            <Tab eventKey="stake" title="Stake">
                                <div className="row">
                                    <div className="action-col col-xs-12 col-md-6">
                                        <div className="action-hint mt-3">
                                            Deposit your LP tokens to earn ZUN on top of native
                                            rewards
                                        </div>
                                        <div className="input mt-3">
                                            <div className="coins">
                                                <img src="/uzd.svg" alt="" />
                                                <img
                                                    src="/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e.png"
                                                    alt=""
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={depositSum}
                                                inputMode={'decimal'}
                                                autoComplete={'off'}
                                                autoCorrect={'off'}
                                                pattern={'^[0-9]*[.,]?[0-9]*$'}
                                                placeholder={'0.00'}
                                                min={0}
                                                minLength={1}
                                                maxLength={8}
                                                onChange={(e) => {
                                                    setDepositSum(e.target.value);
                                                }}
                                            />
                                            <button
                                                className="max"
                                                onClick={(e) => {
                                                    setDepositSum(
                                                        getFullDisplayBalance(maxStakingSum, 18, 18)
                                                    );
                                                }}
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>
                                    <div className="action-col col-xs-12 col-md-6">
                                        <div className="steps mt-3">
                                            <div className="digits">
                                                <div className="digit">1</div>
                                                <div className="digit">2</div>
                                            </div>
                                            <div className="d-flex gap-2 mt-3">
                                                <button
                                                    className={`zun-button ${
                                                        stakingApproved ? 'disabled' : ''
                                                    }`}
                                                    onClick={async () => {
                                                        setPendingTx(true);
                                                        if (approve) {
                                                            approve();
                                                        }
                                                        setPendingTx(false);
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className={`zun-button ${
                                                        !stakingEnabled ? 'disabled' : ''
                                                    }`}
                                                    onClick={async () => {
                                                        setPendingTx(true);
                                                        if (stakingDeposit) {
                                                            try {
                                                                const tx = await stakingDeposit();
                                                                setTransactionId(tx);
                                                            } catch (e: any) {
                                                                log(
                                                                    `Error while making staking deposit:`
                                                                );
                                                                log(e.message);
                                                                setTransactionError(e.message);
                                                            }
                                                        }
                                                        setPendingTx(false);
                                                    }}
                                                >
                                                    Stake
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="unstake" title="Unstake">
                                <div className="row">
                                    <div className="action-col col-xs-12 col-md-6">
                                        <div className="action-hint mt-3">
                                            Deposit your LP tokens to earn ZUN on top of native
                                            rewards
                                        </div>
                                        <div className="input mt-3">
                                            <div className="coins">
                                                <img src="/uzd.svg" alt="" />
                                                <img
                                                    src="/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e.png"
                                                    alt=""
                                                />
                                            </div>
                                            <input type="text" value={'0.00'} readOnly />
                                            <button className="max">MAX</button>
                                        </div>
                                    </div>
                                    <div className="action-col col-xs-12 col-md-6">
                                        <div className="steps mt-3">
                                            <div className="digits">
                                                <div className="digit">1</div>
                                                <div className="digit">2</div>
                                            </div>
                                            <div className="d-flex gap-2 mt-3">
                                                <button className="zun-button">Approve</button>
                                                <button className="zun-button disabled">
                                                    Unstake
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </Accordion.Body>
        </Accordion.Item>
    );
};
