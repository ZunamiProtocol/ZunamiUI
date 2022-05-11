import { useHistory } from 'react-router';
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
        <div className={'ClickableHeader'} data-section={props.name}>
            <span>{props.name}</span>
            <img onClick={clickHandler} src="exit.png" alt="" className={'close default'} />
            <img onClick={clickHandler} src="exit-white.svg" alt="" className={'close dark'} />
        </div>
    );
};
