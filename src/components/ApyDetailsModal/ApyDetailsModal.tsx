import { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './ApyDetailsModal.scss';
import { BigNumber } from 'bignumber.js';
import Accordion from 'react-bootstrap/Accordion';
import { sepolia, useNetwork } from 'wagmi';
import { getZunUsdApsAddress } from '../../utils/zunami';

interface ApyDetailsModalProps {
    show: boolean;
    onHide?: Function;
    currentApy: number | string;
}

function getApsContractUrl(chainId: number | undefined): string {
    return `https://${
        chainId === sepolia.id ? 'sepolia.' : ''
    }etherscan.io/address/${getZunUsdApsAddress(chainId)}`;
}

export const ApyDetailsModal = (props: ApyDetailsModalProps): JSX.Element => {
    const { chain } = useNetwork();

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
            className="ApyDetailsModal"
        >
            <Modal.Header closeButton className="ps-4 pe-4 pt-4">
                <Modal.Title>APY Bar</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex gap-3 flex-column justify-content-center align-items-center">
                <Accordion id="apy-modal-accordion" className="w-100 gap-3" defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Current APY</Accordion.Header>
                        <Accordion.Body>
                            <div className="row">
                                <div className="col-xs-12 col-md-5">
                                    <div className="row">
                                        <div className="col-8">Current APY</div>
                                        <div className="col-4">{props.currentApy}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">zunUSD</div>
                                        <div className="col-4">0.00%</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">ZUN</div>
                                        <div className="col-4">
                                            <span>soon</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xs-12 col-md-7">
                                    <div className="row">
                                        <div className="col-8">Latest auto-compound</div>
                                        <div className="col-4">$LATEST_AC_DATE</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">Collected rewards</div>
                                        <div className="col-4">
                                            <div>$REWARDS_AMOUNT</div>
                                            <button className="zun-button mt-2">Harvest</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Projected APY</Accordion.Header>
                        <Accordion.Body>
                            This is a yield indicator based on accumulated rewards that have not
                            been harvested and auto-compounded yet. Current accumulated rewards:
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Where do rewards accrue?</Accordion.Header>
                        <Accordion.Body>
                            The yield is generated through rewards for providing liquidity on Curve
                            Finance and staking LP tokens on Convex & StakeDAO. All rewards are
                            automatically reinvested back into the pool, and you don't need to
                            perform any claiming operations.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>Fees</Accordion.Header>
                        <Accordion.Body>
                            A 15% performance fee, garnered from the earnings of APS depositors
                            utilizing auto-compounding strategies, contributes to ZUN stakers'
                            revenue stream. APY in the interface already includes all fees.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
                        <Accordion.Header>Contracts</Accordion.Header>
                        <Accordion.Body>
                            APS:{' '}
                            <a href={getApsContractUrl(chain?.id)} target="_blank" rel="noreferrer">
                                go to Etherscan
                            </a>
                            <br />
                            Reward Manager:
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Modal.Body>
        </Modal>
    );
};
