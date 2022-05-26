import './Disclaimer.scss';
import { ReactComponent as Icon } from './icon.svg';

interface DisclaimerProps {
    text: JSX.Element;
}

export const Disclaimer = (
    props: DisclaimerProps & React.HTMLProps<HTMLButtonElement>
): JSX.Element => {
    return (
        <div className={'Disclaimer'}>
            <Icon className={'Disclaimer__icon'} />
            <div className={'Disclaimer__Content'}>{props.text}</div>
        </div>
    );
};
