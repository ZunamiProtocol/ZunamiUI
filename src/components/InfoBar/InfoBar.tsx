import React from 'react';
import { Button } from 'react-bootstrap';
import './InfoBar.scss';

interface InfoBarProps {
    // onClick: any;
}

export const InfoBar = (props: InfoBarProps): JSX.Element => {
    return (
        <div className="card InfoBar">
            <div className="card-body">
                <div className="title">Info bar</div>
                <div className="values">
                    <div className="block">
                        <img src="/convex.svg" alt="" />
                        <div>
                            <span className="name">Default pool</span>
                            <span className="value">Convex finance USDD pool</span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Slippage rate</span>
                            <span className="value">~ 0.43%</span>
                        </div>
                    </div>
                    <div className="block">
                        <div>
                            <span className="name">Base APY</span>
                            <span className="value">17%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
