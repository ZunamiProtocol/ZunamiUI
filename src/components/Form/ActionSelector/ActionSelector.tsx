import { useNavigate } from 'react-router-dom';
import './ActionSelector.scss';

interface ActionSelectorProps {
    value?: string;
    onChange: any;
    actions: Array<any>;
}

export const ActionSelector = (props: ActionSelectorProps): JSX.Element => {
    const action = props.value || 'deposit';
    const navigate = useNavigate();
    const actions = props.actions;

    return (
        <div className="ActionSelector">
            {actions.map((item) => (
                <div
                    key={item.name}
                    className={`ActionSelector__Action ${
                        action === item.name ? 'ActionSelector__Action__Active' : ''
                    } ${item.disabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                        if (item.hasOwnProperty('url')) {
                            navigate(`/${item.name}`);
                        }

                        if (props.onChange) {
                            props.onChange(item.name);
                        }
                    }}
                >
                    <span>{item.title}</span>
                </div>
            ))}
        </div>
    );
};
