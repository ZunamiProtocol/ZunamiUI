import React from 'react';
import { Button } from 'react-bootstrap';
import './SupportersBar.scss';

interface SupporterBarProps {
    section: string;   
}

export const SupportersBar = (props: SupporterBarProps): JSX.Element => {
    return (
        <div className="supporters-bar container" data-section={props.section}>
            <div className="row">
                <div className="col d-flex justify-content-end  align-items-center">
                    <span className="text-muted">Supported by</span>
                    <div className="supporters-links">
                        <a href="https://dao.curve.fi/vote/ownership/299" target='_blank' rel='noreferrer'>
                            <img src="/curve-icon.svg" alt="" />
                            <span>Curve</span>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7"/>
                                <path d="M4.99947 1L1.13672 4.86364" stroke="#BFBFBF" strokeWidth="0.7"/>
                            </svg>
                        </a>
                        <a href="https://vote.convexfinance.com/#/proposal/0x43be12c3bbfc187e94b1f112f54c5fb1622ad7ef1ddfe055b7d01bd8405d0454" target='_blank' rel='noreferrer'>
                            <img src="/convex.svg" alt="" />
                            <span>Convex</span>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7"/>
                                <path d="M4.99947 1L1.13672 4.86364" stroke="#BFBFBF" strokeWidth="0.7"/>
                            </svg>
                        </a>
                        <a href="https://lockers.stakedao.org/governance/0x3e32abc0270d57cac7cac8b0001b41b88f8615ed6b8c29825c2dadaadd4af707" target='_blank' rel='noreferrer'>
                            <img src="/stake-dao.svg" alt="" />
                            <span>Stake DAO</span>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H5V5" stroke="#BFBFBF" strokeWidth="0.7"/>
                                <path d="M4.99947 1L1.13672 4.86364" stroke="#BFBFBF" strokeWidth="0.7"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
