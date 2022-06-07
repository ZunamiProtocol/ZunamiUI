import { useHistory } from 'react-router';
import './ClickableHeader.scss';

interface ClickableHeaderProps extends React.HTMLProps<HTMLDivElement> {
    name: string;
}

export const ClickableHeader: React.FC<ClickableHeaderProps> = ({ name, ...props }) => {
    const history = useHistory();

    const clickHandler = () => {
        history.push('/');
    };

    const classNames = ['ClickableHeader', props.className].join(' ');

    return (
        <div className={classNames} data-section={name} {...props}>
            <span>{name}</span>
            <img onClick={clickHandler} src="exit.png" alt="" className={'close default'} />
            <img onClick={clickHandler} src="exit-white.svg" alt="" className={'close dark'} />
        </div>
    );
};
