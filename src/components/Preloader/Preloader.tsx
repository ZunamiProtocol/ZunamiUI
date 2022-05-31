import './Preloader.scss';

interface PreloaderProps extends React.HTMLProps<HTMLDivElement> {
    onlyIcon?: boolean;
}

export const Preloader = (props: PreloaderProps): JSX.Element => {
    return (
        <div className="Preloader">
            <img src="/preloader.gif" alt="..." />
            {!props.onlyIcon && <span>Please, wait...</span>}
        </div>
    );
};
