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
    secondaryDesc?: string;
    secondaryHint?: string;
}

export const InfoBlock = (props: InfoBlockProps): JSX.Element => {
    const target = useRef(null);
    const [show, setShow] = useState(false);

    return (
        <div
            className={`InfoBlock ${props.isStrategy === true ? 'InfoBlock_long' : ''}
            ${props.isLong === true ? 'InfoBlock_mobileLong' : ''}
        `}
            data-title={props.title}
        >
            <div className={'InfoBlock__title'}>
                {props.iconName !== undefined ? <img src={props.iconName + '.svg'} alt=""/> : ''}
                <span>{props.title}</span>
            </div>
            {
                props.isLoading &&
                    <div className={'preloader mt-3'}></div>
            }
            {
                !props.isLoading && !props.secondaryDesc &&
                <span
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}>
                    <div>{props.description}</div>
                </span>
            }
            {
                !props.isLoading && props.secondaryDesc &&
                <span
                    className={`InfoBlock__description ${
                        props.withColor === true ? 'InfoBlock__description_color' : ''
                    }`}>
                    <span className={'InfoBlock__description__secondary'}>{props.secondaryDesc}</span>
                    <span
                        className={'hint'}
                        ref={target}
                        onClick={() => setShow(!show)}
                    >?</span>
                    <Overlay target={target.current} show={show} placement="right">
                        <Tooltip>{props.secondaryHint}</Tooltip>
                    </Overlay>
                </span>
            }
        </div>
    );
};
