import './ComingSoonPlaceholder.scss';

export const ComingSoonPlaceholder = (props: React.HTMLProps<HTMLDivElement>): JSX.Element => {
    return (
        <div className={'ComingSoonPlaceholder'} {...props}>
            Available soon
        </div>
    );
};
