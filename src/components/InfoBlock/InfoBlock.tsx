import {useRef, useState} from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';
import './InfoBlock.scss';

interface InfoBlockProps {
    iconName?: string;
    title: string;
    description: string;
    withColor: boolean;
    isStrategy: boolean;
    isLong: boolean;
    isLoading?: boolean;
    secondaryRow?: JSX.Element|undefined;
    hint?: string;
}

export const InfoBlock = (props: InfoBlockProps): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    return (
        <div
            className={
            `InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}
            ${props.isLong === true ? 'InfoBlock_mobileLong' : ''}
            ${props.secondaryRow ? 'InfoBlock_secondaryRow' : ''}
        `}
            data-title={props.title}
        >
            <div className={'InfoBlock__title'}>
                {props.iconName !== undefined ? <img src={props.iconName} alt=""/> : ''}
                <span>{props.title}</span>
                {
                    props.hint &&
                        <div
                            className={'InfoBlock__hint'}
                            ref={target}
                            onClick={() => setShowHint(!showHint)}
                        >
                            <img src={'/info.svg'} alt={'Pending deposit'} />
                            <Overlay target={target.current} show={showHint} placement="right">
                                <Tooltip>{props.hint}</Tooltip>
                            </Overlay>
                        </div>
                }

            </div>
            {
                props.isLoading &&
                    <div className={'preloader mt-3'}></div>
            }
            {
                !props.isLoading &&
                <span
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}>
                    <div>{props.description}</div>
                </span>
            }
            {
                !props.isLoading && props.secondaryRow &&
                    props.secondaryRow
            }
        </div>
    );
};
