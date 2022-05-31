import './Preloader.scss';

interface PreloaderProps extends React.HTMLProps<HTMLDivElement> {
    onlyIcon?: boolean;
}

export const Preloader : React.FC<PreloaderProps> = ({
    onlyIcon,
    className,
    ...props
}) => {
    let classNames = ['Preloader', className].join(' ');

    return (
        <div className={classNames} {...props}>
            <img src="/preloader.gif" alt="..." />
            {!onlyIcon && <span>Please, wait...</span>}
        </div>
    );
};
