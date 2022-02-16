import {useRef, useState} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import './InfoBlock.scss';

interface InfoBlockProps {
    iconName?: string;
    title: string;
    description?: string;
    withColor: boolean;
    isStrategy: boolean;
    isLoading?: boolean;
    secondaryRow?: JSX.Element|undefined;
    hint?: string;
    colorfulBg?: boolean;
}

export const InfoBlock = (props: InfoBlockProps): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);

    return (
        <div
            className={
            `InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}
            ${props.colorfulBg === true ? 'InfoBlock_colorful' : ''}
            ${props.secondaryRow ? 'InfoBlock_secondaryRow' : ''}
        `}
            data-title={props.title}
        >
            <div className={`InfoBlock__title ${props.hint ? 'with_hint' : ''}`}>
                <span>{props.title}</span>
                {
                    props.hint &&
                        <div
                            className={'InfoBlock__hint'}
                            ref={target}
                            onClick={() => setShowHint(!showHint)}
                        >
                            
                            <OverlayTrigger
                                placement="right"
                                overlay={
                                    <Tooltip>{props.hint}</Tooltip>
                                }
                            >
                                <img src={'/info.svg'} alt={'Pending deposit'} />
                            </OverlayTrigger>
                        </div>
                }

            </div>
            {
                props.isLoading &&
                    <div className={'preloader mt-3'}></div>
            }
            {
                !props.isLoading &&
                <div
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}>
                    <div>{props.description}</div>
                </div>
            }
            {
                !props.isLoading && props.secondaryRow &&
                    props.secondaryRow
            }
        </div>
    );
};
