import './MobileSidebar.scss';
import { NavMenu } from '../../Header/NavMenu/NavMenu';
import { ThemeSwitcher } from '../../ThemeSwitcher/ThemeSwitcher';

export const MobileSidebar = (): JSX.Element => {
    return (
        <div id="MobileSidebar">
            <NavMenu
                onSelect={() => {
                    document.body.classList.remove('overflow');
                }}
            />

            <ul className="secondary-menu list-inline">
                <li className="list-inline-item">
                    <ThemeSwitcher />
                </li>
                <li className="list-inline-item">
                    <a
                        href="https://zunamilab.gitbook.io/product-docs/activity/liquidity-providing"
                        target="blank"
                    >
                        View docs
                    </a>
                </li>
                <li className="list-inline-item">
                    <a href="https://www.zunami.io/#faq-main" target="blank">
                        FAQ
                    </a>
                </li>
                <li className="list-inline-item">
                    <a href="https://zunami.io" target="blank">
                        Website
                    </a>
                </li>
            </ul>
        </div>
    );
};
