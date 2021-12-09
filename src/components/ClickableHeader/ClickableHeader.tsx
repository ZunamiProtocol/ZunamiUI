import {useHistory} from 'react-router';
import './ClickableHeader.scss';

interface ClickableHeaderProps {
    name: string;
    icon: string;
}

export const ClickableHeader = (props: ClickableHeaderProps): JSX.Element => {
    const history = useHistory();

    const clickHandler = () => {
        history.push('/');
    };

    return (
        <div className={'ClickableHeader'}>
            <span>{props.name}</span>
            <img src={props.icon} alt={''} className={'bg'} />
            <img onClick={clickHandler} src='exit.png' alt='' className={'close'} />
        </div>
    );
};
