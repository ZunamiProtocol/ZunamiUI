import React from 'react';
import { useHistory } from 'react-router-dom';
import './LinkBlock.scss';
import { ComingSoonPlaceholder } from '../ComingSoonPlaceholder/ComingSoonPlaceholder';
import { TestnetLabel } from '../TestnetLabel/TestnetLabel';

interface LinkBlockProps {
    title: string;
    description: string;
    url: string;
    icon: string;
    vstyle?: string;
    soon?: boolean;
    testnet?: boolean;
}

export const LinkBlock = (prop: LinkBlockProps): JSX.Element => {
    const history = useHistory();
    const url = `/${prop.url}`;

    const clickHandler = () => {
        if (prop.url.indexOf('http') !== -1) {
            window.open(prop.url, '_blank');
            return;
        }

        history.push(url);
        document.body.classList.remove('overflow');
    };

    const styles = ['LinkBlock'];

    if (prop.vstyle) {
        styles.push(`LinkBlock__${prop.vstyle}`);
    }

    if (window.location.pathname === url) {
        styles.push('LinkBlock__active');
    }

    if (prop.soon) {
        styles.push('LinkBlock__soon');
    }

    return (
        <div className={styles.join(' ')} onClick={clickHandler} data-url={url}>
            <div className="LinkBlock__icon">
                <img src={prop.icon} alt={prop.title} />
            </div>
            <span className="LinkBlock__title">{prop.title}</span>
            {prop.soon && <ComingSoonPlaceholder />}
            {prop.testnet && <TestnetLabel />}
        </div>
    );
};
