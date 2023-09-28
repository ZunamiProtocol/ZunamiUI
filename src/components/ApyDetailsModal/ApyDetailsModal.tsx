import { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './ApyDetailsModal.scss';
import { BigNumber } from 'bignumber.js';
import Accordion from 'react-bootstrap/Accordion';

interface ApyDetailsModalProps {
    show: boolean;
    onHide?: Function;
}

export const ApyDetailsModal = (props: ApyDetailsModalProps): JSX.Element => {
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
            <Modal.Header closeButton>
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
                                        <div className="col-4">25%</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">UZD</div>
                                        <div className="col-4">15%</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">ZUN</div>
                                        <div className="col-4">10%</div>
                                    </div>
                                </div>
                                <div className="col-xs-12 col-md-7">
                                    <div className="row">
                                        <div className="col-8">Latest auto-compound</div>
                                        <div className="col-4">August, 19 2023</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">Collected rewards</div>
                                        <div className="col-4">
                                            <div>$225,435</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Projected APY</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                            occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Where do rewards accrue?</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                            occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>Fees</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                            occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
                        <Accordion.Header>Contracts</Accordion.Header>
                        <Accordion.Body>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                            occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Modal.Body>
        </Modal>
    );
};
