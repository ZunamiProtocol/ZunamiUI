import './Disclaimer.scss';
import { ReactComponent as Icon } from './icon.svg';

interface DisclaimerProps {
    text: JSX.Element;
}

export const Disclaimer = (props: DisclaimerProps): JSX.Element => {
    return (
        <div className={'Disclaimer'}>
            <Icon className={'Disclaimer__icon'} />
            <div className={'Disclaimer__Content'}>{props.text}</div>
        </div>
    );
};
