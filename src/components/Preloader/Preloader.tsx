import './Preloader.scss';

export const Preloader = (): JSX.Element => {
    return (
        <div className="Preloader">
            <img src="/preloader.gif" />
            <span>Please, wait...</span>
        </div>
    );
};
