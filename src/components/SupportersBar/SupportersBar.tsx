import React from 'react';
import { Button } from 'react-bootstrap';
import './SupportersBar.scss';

interface SupporterBarProps {
    section: string;
}

export const SupportersBar: React.FC<SupporterBarProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    section,
}) => {
    return (
        <div className={`supporters-bar container ${className}`} data-section={section}>
            <div className="row">
                <div className="col d-flex justify-content-end align-items-center">
                    <span className="text-muted">Supported by</span>
                    <div className="supporters-links">
                        <a
                            href="https://dao.curve.fi/vote/ownership/299"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/curve-icon.svg" alt="" />
                            <span>Curve</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                        <a
                            href="https://vote.convexfinance.com/#/proposal/0x43be12c3bbfc187e94b1f112f54c5fb1622ad7ef1ddfe055b7d01bd8405d0454"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/convex.svg" alt="" />
                            <span>Convex</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                        <a
                            href="https://lockers.stakedao.org/governance/0x3e32abc0270d57cac7cac8b0001b41b88f8615ed6b8c29825c2dadaadd4af707"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/stake-dao.svg" alt="" />
                            <span>Stake DAO</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                        <a
                            href="https://snapshot.org/#/frax.eth/proposal/0xa47c83748f0e8e8af85c967bc876bd62a40fa5f109b1b923feb42155ff3c4fdb"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/frax.svg" alt="" />
                            <span>Frax</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                        <a
                            href="https://snapshot.org/#/balancer.eth/proposal/0xb64a06bbf7a42bb6329a4da81f8dbff48c7f6071becf28b8f9c245a515ef5b7a"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/balancer.svg" alt="" />
                            <span>Balancer</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                        <a
                            href="https://snapshot.org/#/aurafinance.eth/proposal/0x7690738974a912c927497aeac331a5bbf3bb400edfde70730714f85fd8a9fe41"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="/aura.svg" alt="" />
                            <span>Aura</span>
                            <svg
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7" />
                                <path
                                    d="M4.99947 1L1.13672 4.86364"
                                    stroke="#BFBFBF"
                                    strokeWidth="0.7"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
