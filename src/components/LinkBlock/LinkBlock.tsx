import React from 'react';
import { useHistory } from 'react-router-dom';
import './LinkBlock.scss';
import { ComingSoonPlaceholder } from '../ComingSoonPlaceholder/ComingSoonPlaceholder';
import { TestnetLabel } from '../TestnetLabel/TestnetLabel';

interface LinkBlockProps extends React.HTMLProps<HTMLDivElement> {
    title: string;
    description: string;
    url: string;
    icon: string;
    vstyle?: string;
    soon?: boolean;
    testnet?: boolean;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({
    title,
    description,
    url,
    icon,
    vstyle,
    soon,
    testnet,
    ...props
}) => {
    const history = useHistory();
    const fullUrl = `/${url}`;

    const clickHandler = () => {
        if (url.indexOf('http') !== -1) {
            window.open(url, '_blank');
            return;
        }

        history.push(fullUrl);
        document.body.classList.remove('overflow');
    };

    const styles = ['LinkBlock'];

    if (vstyle) {
        styles.push(`LinkBlock__${vstyle}`);
    }

    if (window.location.pathname === url) {
        styles.push('LinkBlock__active');
    }

    if (soon) {
        styles.push('LinkBlock__soon');
    }

    return (
        <div className={styles.join(' ')} onClick={clickHandler} data-url={url} {...props}>
            <div className="LinkBlock__icon">
                <img src={icon} alt={title} />
            </div>
            <span className="LinkBlock__title">{title}</span>
            {soon && <ComingSoonPlaceholder />}
            {testnet && <TestnetLabel />}
        </div>
    );
};
