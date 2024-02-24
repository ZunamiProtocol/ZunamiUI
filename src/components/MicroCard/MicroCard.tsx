import { useState, useRef } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ReactComponent as HintIcon } from '../../assets/info.svg';
import './MicroCard.scss';
import { OverlayChildren } from 'react-bootstrap/esm/Overlay';

interface MicroCardProps {
    title: string;
    hint?: string;
    popover?: OverlayChildren;
    value?: string | number;
    children?: string | JSX.Element | JSX.Element[];
}

export const MicroCard: React.FC<MicroCardProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    title,
    hint,
    value,
    children,
    popover,
}): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);
    const [popoverVisible, setPopoverVisible] = useState(false);

    return (
        <div className={`microcard gray-block small-block ps-3  ${className ?? ''}`}>
            <div className="d-flex align-items-center gap-2 mw-100">
                <span className="name">{title}</span>
                {hint && (
                    <div ref={target} onClick={() => setShowHint(!showHint)} className="hint gap-2">
                        <OverlayTrigger placement="right" overlay={<Tooltip>{hint}</Tooltip>}>
                            <HintIcon />
                        </OverlayTrigger>
                    </div>
                )}
                {popover && (
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="right"
                        overlay={popover}
                        show={popoverVisible}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            onMouseEnter={() => setPopoverVisible(true)}
                            onMouseLeave={() => setPopoverVisible(false)}
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM6.23296 9.97261H4.98638L5.79002 7.12336H3.02741V5.87679H6.14162L6.94529 3.02741H8.19186L7.38819 5.87679L9.97261 5.87679V7.12336H7.03659L6.23296 9.97261Z"
                                fill="black"
                                className="chameleon-svg"
                            />
                        </svg>
                    </OverlayTrigger>
                )}
            </div>
            <div className="vela-sans value mt-1">{value || children}</div>
        </div>
    );
};
