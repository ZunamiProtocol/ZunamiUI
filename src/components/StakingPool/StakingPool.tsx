import Accordion from 'react-bootstrap/Accordion';
import { MicroCard } from '../../components/MicroCard/MicroCard';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './StakingPool.scss';
import { StakingPoolInfo } from '../../hooks/useStakingPools';

interface StakingPoolProps extends StakingPoolInfo {
    index: string;
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
}) => {
    return (
        <Accordion.Item eventKey={index}>
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
                        <div>{tvl}</div>
                    </div>
                    <div className="apr vela-sans">
                        <div className="header">APR</div>
                        <div>{apr}%</div>
                    </div>
                    <div className="deposit-val vela-sans">
                        <div className="header">Your deposit</div>
                        <div>$1,300</div>
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
                    <MicroCard title="TVL" value={tvl} />
                    <MicroCard title="APR" value={`${apr}%`} hint="Some tooltip content" />
                    <MicroCard title="Deposit" value="$1,300" />
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
                                                <button
                                                    className="zun-button"
                                                    onClick={async () => {
                                                        // setPendingTx(true);
                                                        // if (approve) {
                                                        //     approve();
                                                        // }
                                                        // setPendingTx(false);
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button className="zun-button disabled">
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
