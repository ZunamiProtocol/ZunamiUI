import './Disclaimer.scss';
import { ReactComponent as Icon } from './icon.svg';

interface DisclaimerProps extends React.HTMLProps<HTMLDivElement> {
    text: JSX.Element;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ text, ...props }) => {
    return (
        <div className={'Disclaimer'} {...props}>
            <Icon className={'Disclaimer__icon'} />
            <div className={'Disclaimer__Content'}>{text}</div>
        </div>
    );
};
