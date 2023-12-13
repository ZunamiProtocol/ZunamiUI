import { useState, useRef } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ReactComponent as HintIcon } from '../../assets/info.svg';

interface MicroCardProps {
    title: string;
    hint?: string;
    value?: string;
    children?: string | JSX.Element | JSX.Element[];
}

export const MicroCard: React.FC<MicroCardProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    title,
    hint,
    value,
    children,
}): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    return (
        <div className={`microcard gray-block small-block ps-3  ${className ?? ''}`}>
            <div className="d-flex align-items-center gap-2">
                <span className="name">{title}</span>
                {hint && (
                    <div ref={target} onClick={() => setShowHint(!showHint)} className="hint gap-2">
                        <OverlayTrigger placement="right" overlay={<Tooltip>{hint}</Tooltip>}>
                            <HintIcon />
                        </OverlayTrigger>
                    </div>
                )}
            </div>
            <div className="vela-sans value mt-1">{value || children}</div>
        </div>
    );
};
