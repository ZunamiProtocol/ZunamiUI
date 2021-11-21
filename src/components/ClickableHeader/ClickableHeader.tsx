import './ClickableHeader.scss';

interface ClickableHeaderProps {
    name: string;
}

export const ClickableHeader = (props: ClickableHeaderProps): JSX.Element => {
    return (
        <div className={'ClickableHeader'}>
            <span>{props.name}</span>
            <img src={'/section-header-bg.svg'} alt={''} className={''} />
        </div>
    );
};
