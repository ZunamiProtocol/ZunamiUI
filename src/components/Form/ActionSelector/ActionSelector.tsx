import { useHistory } from 'react-router-dom';
import './ActionSelector.scss';

interface ActionSelectorProps {
    value?: string;
    onChange: any;
}

const actions = [
    {
        name: 'deposit',
        title: 'Deposit',
    },
    {
        name: 'withdraw',
        title: 'Withdraw',
    },
];

export const ActionSelector = (props: ActionSelectorProps): JSX.Element => {
    const action = props.value || 'deposit';
    const history = useHistory();

    return (
        <div className="ActionSelector">
            {actions.map((item) => (
                <div
                    key={item.name}
                    className={`ActionSelector__Action ${
                        action === item.name ? 'ActionSelector__Action__Active' : ''
                    }`}
                    onClick={(e) => {
                        history.push(`/${item.name}`);

                        if (props.onChange) {
                            props.onChange(item.name);
                        }
                    }}
                >
                    <span>{item.title}</span>
                    {item.name === 'deposit' && (
                        <svg
                            width="54"
                            height="38"
                            viewBox="0 0 54 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill={`${action === 'deposit' ? '#ffffff' : '#F1DEAE'}`}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2.1139 37.3535C1.85338 37.3541 1.58905 37.3107 1.33379 37.2198C0.449276 36.8997 -0.0982817 36.0674 0.0140383 35.2095C1.64592 23.076 10.559 13.1866 22.4561 9.0022C22.9994 8.81113 23.538 8.69588 24.0657 8.6492C26.0438 8.05204 28.096 7.6087 30.2039 7.33405C31.8622 7.11797 33.1742 5.75171 33.1742 4.07937C33.1742 1.26238 34.934 0.000471356 36.6798 0.000471508C37.8202 0.000471608 38.9605 0.497584 40.0587 1.49182L52.0255 12.3264C54.6582 14.71 54.6582 18.5722 52.0255 20.9558L40.0587 31.7904C38.9605 32.7718 37.8202 33.2817 36.6798 33.2817C34.934 33.2817 33.1742 32.0198 33.1742 29.2028C33.1742 27.3119 31.8083 25.6722 29.921 25.5554C29.2508 25.5139 28.5798 25.4936 27.9088 25.4936C18.4339 25.4936 9.4236 29.6362 3.82032 36.5703C3.41494 37.075 2.77612 37.355 2.1139 37.3535Z"
                            />
                        </svg>
                    )}
                    {item.name === 'withdraw' && (
                        <svg
                            width="54"
                            height="38"
                            viewBox="0 0 54 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill={`${action === 'withdraw' ? '#ffffff' : '#F1DEAE'}`}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M51.8861 6.32103e-06C52.1466 -0.000602781 52.4109 0.0428003 52.6662 0.133738C53.5507 0.453845 54.0983 1.28612 53.986 2.14401C52.3541 14.2775 43.441 24.167 31.5439 28.3513C31.0006 28.5424 30.462 28.6576 29.9343 28.7043C27.9562 29.3015 25.904 29.7448 23.7962 30.0195C22.1378 30.2355 20.8258 31.6018 20.8258 33.2741C20.8258 36.0911 19.066 37.353 17.3202 37.353C16.1798 37.353 15.0395 36.8559 13.9413 35.8617L1.97452 25.0271C-0.658175 22.6435 -0.658175 18.7813 1.97452 16.3977L13.9413 5.56316C15.0395 4.58168 16.1798 4.07182 17.3202 4.07182C19.066 4.07182 20.8258 5.33373 20.8258 8.15071C20.8258 10.0416 22.1917 11.6813 24.079 11.7981C24.7492 11.8396 25.4202 11.86 26.0912 11.86C35.5661 11.86 44.5764 7.71733 50.1797 0.783208C50.5851 0.278552 51.2239 -0.00153313 51.8861 6.32103e-06Z"
                            />
                        </svg>
                    )}
                </div>
            ))}
        </div>
    );
};
