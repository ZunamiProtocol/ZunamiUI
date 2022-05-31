import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import './InfoBlock.scss';

interface InfoBlockProps {
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

export const InfoBlock = (
    props: InfoBlockProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    const popover = (
        <Popover onMouseEnter={() => setShowHint(true)} onMouseLeave={() => setShowHint(false)}>
            <Popover.Body>{props.hint}</Popover.Body>
        </Popover>
    );

    return (
        <div
            className={`InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}
            ${props.colorfulBg === true ? 'InfoBlock_colorful' : ''}
            ${props.secondaryRow ? 'InfoBlock_secondaryRow' : ''}
        `}
            data-title={props.title}
        >
            <div className={`InfoBlock__title ${props.hint ? 'with_hint' : ''}`}>
                {!props.isLoading && props.icon && props.icon}
                <span>{props.title}</span>
                {props.hint && (
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
            {props.isLoading && <div className={'preloader mt-3'}></div>}
            {!props.isLoading && (
                <div
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}
                >
                    <div>{props.description}</div>
                </div>
            )}
            {!props.isLoading && props.secondaryRow && props.secondaryRow}
        </div>
    );
};
