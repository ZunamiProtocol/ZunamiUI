import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import './InfoBlock.scss';

interface InfoBlockProps extends React.HTMLProps<HTMLDivElement> {
    iconName?: string;
    title: string;
    description?: string | JSX.Element;
    withColor: boolean;
    isStrategy: boolean;
    isLoading?: boolean;
    secondaryRow?: JSX.Element | undefined;
    hint?: JSX.Element;
    colorfulBg?: boolean;
    icon?: JSX.Element | undefined;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({
    iconName,
    title,
    description,
    withColor,
    isStrategy,
    isLoading,
    secondaryRow,
    hint,
    colorfulBg,
    icon,
    ...props
}) => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    const popover = (
        <Popover onMouseEnter={() => setShowHint(true)} onMouseLeave={() => setShowHint(false)}>
            <Popover.Body>{hint}</Popover.Body>
        </Popover>
    );

    return (
        <div
            className={`InfoBlock ${isStrategy === true ? 'InfoBlock_long' : ''}
            ${colorfulBg === true ? 'InfoBlock_colorful' : ''}
            ${secondaryRow ? 'InfoBlock_secondaryRow' : ''}
        `}
            data-title={title}
            {...props}
        >
            <div className={`InfoBlock__title ${hint ? 'with_hint' : ''}`}>
                {!isLoading && icon && icon}
                <span>{title}</span>
                {hint && (
                    <div
                        className={'InfoBlock__hint'}
                        ref={target}
                        onClick={() => setShowHint(!showHint)}
                    >
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            placement="right"
                            overlay={popover}
                            show={showHint}
                        >
                            <img
                                onMouseEnter={() => setShowHint(true)}
                                onMouseLeave={() => setShowHint(false)}
                                src={'/info.svg'}
                                alt={'Pending deposit'}
                            />
                        </OverlayTrigger>
                    </div>
                )}
            </div>
            {isLoading && <div className={'preloader mt-3'}></div>}
            {!isLoading && (
                <div
                    className={`InfoBlock__description ${
                        withColor === true ? 'InfoBlock__description_color' : ''
                    }`}
                >
                    <div>{description}</div>
                </div>
            )}
            {!isLoading && secondaryRow && secondaryRow}
        </div>
    );
};
