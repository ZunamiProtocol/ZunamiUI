import React from 'react';
import {useHistory} from 'react-router-dom';
import './LinkBlock.scss';

interface LinkBlockProps {
    title: string;
    description: string;
    url: string;
    icon: string;
    vstyle?: string;
}

export const LinkBlock = (prop: LinkBlockProps): JSX.Element => {
    const history = useHistory();
    const url = `/${prop.url}`;

    const clickHandler = () => {
        history.push(url);
    };

    const styles = ['LinkBlock'];

    if (prop.vstyle) {
        styles.push(`LinkBlock__${prop.vstyle}`)
    }

    if (window.location.pathname === url) {
        styles.push('LinkBlock__active');
    }

    return (
        <div
            className={styles.join(' ')}
            onClick={clickHandler}
            data-url={url}
        >
            <span className={'LinkBlock__title'}>{prop.title}</span>
            <span className={'LinkBlock__description'}>{prop.description}</span>
            <div className={'LinkBlock__icon_wrapper'}>
                <img  className={'LinkBlock__icon'} src={prop.icon} alt={''} />
            </div>
        </div>
    );
};
